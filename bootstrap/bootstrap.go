package bootstrap

import (
	"context"
	"fmt"
	"github.com/caarlos0/env/v6"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/config"
	"github.com/hertz-contrib/requestid"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nkeys"
	"github.com/redis/go-redis/v9"
	"github.com/weplanx/transfer"
	"github.com/weplanx/utils/captcha"
	"github.com/weplanx/utils/csrf"
	"github.com/weplanx/utils/locker"
	"github.com/weplanx/utils/passport"
	"github.com/weplanx/utils/resources"
	"github.com/weplanx/utils/sessions"
	"github.com/weplanx/utils/values"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/writeconcern"
	"os"
	"server/admin"
	"server/api"
	"server/common"
	"strings"
	"time"
)

func LoadStaticValues() (v *common.Values, err error) {
	v = new(common.Values)
	if err = env.Parse(v); err != nil {
		return
	}
	v.DynamicValues = &values.DEFAULT
	v.DynamicValues.Resources = map[string]*values.ResourcesOption{
		"users": {
			Keys: []string{"_id", "email", "name", "avatar", "status", "sessions", "last", "create_time", "update_time"},
		},
	}
	return
}

// UseMongoDB
// https://www.mongodb.com/docs/drivers/go/current/
// https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo
func UseMongoDB(v *common.Values) (*mongo.Client, error) {
	return mongo.Connect(
		context.TODO(),
		options.Client().ApplyURI(v.Database.Host),
	)
}

// UseDatabase
// https://www.mongodb.com/docs/drivers/go/current/
// https://pkg.go.dev/go.mongodb.org/mongo-driver/mongo
func UseDatabase(v *common.Values, client *mongo.Client) (db *mongo.Database) {
	option := options.Database().
		SetWriteConcern(writeconcern.New(writeconcern.WMajority()))
	return client.Database(v.Database.Name, option)
}

// UseRedis
// https://github.com/go-redis/redis
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

// UseNats
// https://docs.nats.io/using-nats/developer
// https://github.com/nats-io/nats.go
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
		return nil, fmt.Errorf("nkey 验证失败")
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

// UseJetStream
// https://docs.nats.io/using-nats/developer/develop_jetstream
func UseJetStream(nc *nats.Conn) (nats.JetStreamContext, error) {
	return nc.JetStream(nats.PublishAsyncMaxPending(256))
}

// UseKeyValue
// https://docs.nats.io/using-nats/developer/develop_jetstream/kv
func UseKeyValue(v *common.Values, js nats.JetStreamContext) (nats.KeyValue, error) {
	return js.CreateKeyValue(&nats.KeyValueConfig{Bucket: v.Namespace})
}

func UseValues(v *common.Values, kv nats.KeyValue) *values.Service {
	return values.New(
		values.SetNamespace(v.Namespace),
		values.SetKeyValue(kv),
		values.SetDynamicValues(v.DynamicValues),
	)
}

func UseSessions(v *common.Values, rdb *redis.Client) *sessions.Service {
	return sessions.New(
		sessions.SetNamespace(v.Namespace),
		sessions.SetRedis(rdb),
		sessions.SetDynamicValues(v.DynamicValues),
	)
}

func UseResources(v *common.Values, mgo *mongo.Client, db *mongo.Database, rdb *redis.Client) (*resources.Service, error) {
	return resources.New(
		resources.SetNamespace(v.Namespace),
		resources.SetMongoClient(mgo),
		resources.SetDatabase(db),
		resources.SetRedis(rdb),
		resources.SetDynamicValues(v.DynamicValues),
	)
}

func UseCsrf(v *common.Values) *csrf.Csrf {
	return csrf.New(
		csrf.SetKey(v.Key),
	)
}

func UsePassport(v *common.Values) *passport.Passport {
	return passport.New(
		passport.SetNamespace(v.Namespace),
		passport.SetKey(v.Key),
	)
}

func UseLocker(v *common.Values, client *redis.Client) *locker.Locker {
	return locker.New(
		locker.SetNamespace(v.Namespace),
		locker.SetRedis(client),
	)
}

func UseCaptcha(v *common.Values, client *redis.Client) *captcha.Captcha {
	return captcha.New(
		captcha.SetNamespace(v.Namespace),
		captcha.SetRedis(client),
	)
}

// https://github.com/weplanx/transfer
func UseTransfer(v *common.Values, js nats.JetStreamContext) (*transfer.Transfer, error) {
	return transfer.New(
		transfer.SetNamespace(v.Namespace),
		transfer.SetJetStream(js),
	)
}

// UseApi
// https://www.cloudwego.io/zh/docs/hertz/reference/config
func UseApi(v *common.Values) (h *server.Hertz, err error) {
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

// UseAdmin
// https://www.cloudwego.io/zh/docs/hertz/reference/config
func UseAdmin(v *common.Values) (h *server.Hertz, err error) {
	opts := []config.Option{
		server.WithHostPorts(v.Admin.Address),
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

func SetupApiTest() (api *api.API, err error) {
	v, err := LoadStaticValues()
	if err != nil {
		panic(err)
	}
	if api, err = InitializeAPI(v); err != nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	if _, err = api.Initialize(ctx); err != nil {
		return
	}

	return
}

func SetupAdminTest() (api *admin.API, err error) {
	v, err := LoadStaticValues()
	if err != nil {
		panic(err)
	}
	if api, err = InitializeAdmin(v); err != nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	if _, err = api.Initialize(ctx); err != nil {
		return
	}

	return
}
