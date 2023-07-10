package common

import (
	"fmt"
	"github.com/nats-io/nats.go"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"strings"
)

type Inject struct {
	V         *Values
	Mgo       *mongo.Client
	Db        *mongo.Database
	RDb       *redis.Client
	JetStream nats.JetStreamContext
	KeyValue  nats.KeyValue
}

type Values struct {
	Address   string `env:"ADDRESS" envDefault:":6000"`
	Namespace string `env:"NAMESPACE,required"`
	Key       string `env:"KEY,required"`
	Database  `envPrefix:"DATABASE_"`
	Nats      `envPrefix:"NATS_"`
	*Options
}

func (x Values) Name(v ...string) string {
	return fmt.Sprintf(`%s:%s`, x.Namespace, strings.Join(v, ":"))
}

type Database struct {
	Url   string `env:"URL,required"`
	Name  string `env:"NAME,required"`
	Redis string `env:"REDIS,required"`
}

type Nats struct {
	Hosts []string `env:"HOSTS,required" envSeparator:","`
	Nkey  string   `env:"NKEY,required"`
}

type Options = map[string]*RestOption

type RestOption struct {
	Event bool     `json:"event"`
	Keys  []string `json:"keys"`
}
