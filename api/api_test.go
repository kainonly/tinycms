package api_test

import (
	"context"
	"fmt"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/nats-io/nats.go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"rest-demo/api"
	"rest-demo/bootstrap"
	"rest-demo/common"
	"testing"
	"time"
)

var (
	x *api.API
	h *server.Hertz
)

type M = map[string]interface{}

func TestMain(m *testing.M) {
	values, err := bootstrap.LoadStaticValues()
	values.Options = &common.Options{
		"users": {
			Keys: []string{"name", "department", "roles", "create_time", "update_time"},
		},
		"projects": {
			Event: true,
		},
	}
	if err != nil {
		panic(err)
	}
	if x, err = bootstrap.NewAPI(values); err != nil {
		panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	if err = MockDb(ctx); err != nil {
		panic(err)
	}
	if err = MockStream(ctx); err != nil {
		panic(err)
	}
	if h, err = x.Initialize(ctx, true); err != nil {
		panic(err)
	}
	if err = x.Routes(h); err != nil {
		panic(err)
	}

	os.Exit(m.Run())
}

func MockDb(ctx context.Context) (err error) {
	if err = x.Db.Drop(ctx); err != nil {
		return
	}
	usersOption := options.CreateCollection().
		SetValidator(bson.D{
			{"$jsonSchema", bson.D{
				{"title", "users"},
				{"required", bson.A{"_id", "name", "password", "department", "roles", "create_time", "update_time"}},
				{"properties", bson.D{
					{"_id", bson.M{"bsonType": "objectId"}},
					{"name", bson.M{"bsonType": "string"}},
					{"password", bson.M{"bsonType": "string"}},
					{"department", bson.M{"bsonType": []string{"null", "objectId"}}},
					{"roles", bson.M{
						"bsonType": "array",
						"items":    bson.M{"bsonType": "objectId"},
					}},
					{"create_time", bson.M{"bsonType": "date"}},
					{"update_time", bson.M{"bsonType": "date"}},
				}},
				{"additionalProperties", false},
			}},
		})
	if err = x.Db.CreateCollection(ctx, "users", usersOption); err != nil {
		return
	}
	ordersOption := options.CreateCollection().
		SetValidator(bson.D{
			{"$jsonSchema", bson.D{
				{"title", "orders"},
				{"required", bson.A{"_id", "no", "customer", "phone", "cost", "time", "create_time", "update_time"}},
				{"properties", bson.D{
					{"_id", bson.M{"bsonType": "objectId"}},
					{"no", bson.M{"bsonType": "string"}},
					{"customer", bson.M{"bsonType": "string"}},
					{"phone", bson.M{"bsonType": "string"}},
					{"cost", bson.M{"bsonType": "number"}},
					{"time", bson.M{"bsonType": "date"}},
					{"sort", bson.M{"bsonType": []string{"null", "number"}}},
					{"create_time", bson.M{"bsonType": "date"}},
					{"update_time", bson.M{"bsonType": "date"}},
				}},
				{"additionalProperties", false},
			}},
		})
	if err = x.Db.CreateCollection(ctx, "orders", ordersOption); err != nil {
		return
	}
	projectsOption := options.CreateCollection().SetValidator(bson.D{
		{"$jsonSchema", bson.D{
			{"title", "projects"},
			{"required", bson.A{"_id", "name", "namespace", "secret", "create_time", "update_time"}},
			{"properties", bson.D{
				{"_id", bson.M{"bsonType": "objectId"}},
				{"name", bson.M{"bsonType": "string"}},
				{"namespace", bson.M{"bsonType": "string"}},
				{"secret", bson.M{"bsonType": "string"}},
				{"expire_time", bson.M{"bsonType": []string{"null", "date"}}},
				{"sort", bson.M{"bsonType": []string{"null", "number"}}},
				{"create_time", bson.M{"bsonType": "date"}},
				{"update_time", bson.M{"bsonType": "date"}},
			}},
			{"additionalProperties", false},
		}},
	})
	if err = x.Db.CreateCollection(ctx, "projects", projectsOption); err != nil {
		return
	}
	return
}

func MockStream(ctx context.Context) (err error) {
	for k, v := range *x.V.Options {
		if v.Event {
			name := fmt.Sprintf(`%s:events:%s`, x.V.Namespace, k)
			subject := fmt.Sprintf(`%s.events.%s`, x.V.Namespace, k)
			x.JetStream.DeleteStream(name)
			if _, err = x.JetStream.AddStream(&nats.StreamConfig{
				Name:      name,
				Subjects:  []string{subject},
				Retention: nats.WorkQueuePolicy,
			}, nats.Context(ctx)); err != nil {
				return
			}
		}
	}
	return
}
