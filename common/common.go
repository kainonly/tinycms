package common

import (
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
	"github.com/weplanx/utils/passport"
	"go.mongodb.org/mongo-driver/mongo"
)

type Inject struct {
	V    *Values
	Mgo  *mongo.Client
	Db   *mongo.Database
	RDb  *redis.Client
	Nats *nats.Conn
	Js   nats.JetStreamContext
	Kv   nats.KeyValue
}

func GetClaims(c *app.RequestContext) (claims passport.Claims) {
	value, ok := c.Get("identity")
	if !ok {
		return
	}
	return value.(passport.Claims)
}
