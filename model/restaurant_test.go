package model_test

import (
	"context"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"testing"
)

func TestCreateRestaurantsCollection(t *testing.T) {
	ctx := context.TODO()
	b, err := os.ReadFile("./restaurant.json")
	assert.NoError(t, err)
	var jsonSchema bson.D
	err = bson.UnmarshalExtJSON(b, true, &jsonSchema)
	assert.NoError(t, err)

	n, err := db.ListCollectionNames(ctx, bson.M{"name": "restaurants"})
	assert.NoError(t, err)
	if len(n) == 0 {
		option := options.CreateCollection().SetValidator(jsonSchema)
		err = db.CreateCollection(ctx, "restaurants", option)
		assert.NoError(t, err)
	} else {
		err = db.RunCommand(ctx, bson.D{
			{"collMod", "restaurants"},
			{"validator", jsonSchema},
			{"validationLevel", "strict"},
		}).Err()
		assert.NoError(t, err)
	}

	index := mongo.IndexModel{
		Keys: bson.D{{"sn", 1}},
		Options: options.Index().
			SetUnique(true).
			SetName("idx_sn"),
	}
	r, err := db.Collection("restaurants").Indexes().CreateOne(ctx, index)
	assert.NoError(t, err)
	t.Log(r)
}
