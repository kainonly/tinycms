package bootstrap

import (
	"context"
	"fmt"
	"github.com/caarlos0/env/v9"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/config"
	"github.com/hertz-contrib/requestid"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
	"os"
	"rest-demo/common"
	"strings"
	"time"
)

func LoadStaticValues() (v *common.Values, err error) {
	v = new(common.Values)
	if err = env.Parse(v); err != nil {
		return
	}
	return
}

func UseMongoDB(v *common.Values) (*mongo.Client, error) {
	return mongo.Connect(
		context.TODO(),
		options.Client().ApplyURI(v.Database.Url),
	)
}

func UseDatabase(v *common.Values, client *mongo.Client) (db *mongo.Database) {
	option := options.Database().
		SetWriteConcern(writeconcern.Majority())
	return client.Database(v.Database.Name, option)
}

func UseRedis(v *common.Values) (client *redis.Client, err error) {
	opts, err := redis.ParseURL(v.Database.Redis)
	if err != nil {
		return
	}
	client = redis.NewClient(opts)
	if err = client.Ping(context.TODO()).Err(); err != nil {
		return
	}
	return
}

func UseNats(v *common.Values) (nc *nats.Conn, err error) {
	var kp nkeys.KeyPair
	if kp, err = nkeys.FromSeed([]byte(v.Nats.Nkey)); err != nil {
		return
	}
	defer kp.Wipe()
	var pub string
	if pub, err = kp.PublicKey(); err != nil {
		return
	}
	if !nkeys.IsValidPublicUserKey(pub) {
		return nil, fmt.Errorf("nkey fail")
	}
	if nc, err = nats.Connect(
		strings.Join(v.Nats.Hosts, ","),
		nats.MaxReconnects(5),
		nats.ReconnectWait(2*time.Second),
		nats.ReconnectJitter(500*time.Millisecond, 2*time.Second),
		nats.Nkey(pub, func(nonce []byte) ([]byte, error) {
			sig, _ := kp.Sign(nonce)
			return sig, nil
		}),
	); err != nil {
		return
	}
	return
}

func UseJetStream(nc *nats.Conn) (nats.JetStreamContext, error) {
	return nc.JetStream(nats.PublishAsyncMaxPending(256))
}

func UseKeyValue(v *common.Values, js nats.JetStreamContext) (nats.KeyValue, error) {
	return js.CreateKeyValue(&nats.KeyValueConfig{Bucket: v.Namespace})
}

func UseHertz(v *common.Values) (h *server.Hertz, err error) {
	opts := []config.Option{
		server.WithHostPorts(v.Address),
	}

	if os.Getenv("MODE") != "release" {
		opts = append(opts, server.WithExitWaitTime(0))
	}

	opts = append(opts)

	h = server.Default(opts...)

	h.Use(
		requestid.New(),
	)

	return
}
