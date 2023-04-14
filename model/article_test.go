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

func TestCreateArticlesCollection(t *testing.T) {
	ctx := context.TODO()
	b, err := os.ReadFile("./article.json")
	assert.NoError(t, err)
	var jsonSchema bson.D
	err = bson.UnmarshalExtJSON(b, true, &jsonSchema)
	assert.NoError(t, err)

	n, err := db.ListCollectionNames(ctx, bson.M{"name": "articles"})
	assert.NoError(t, err)
	if len(n) == 0 {
		option := options.CreateCollection().SetValidator(jsonSchema)
		err = db.CreateCollection(ctx, "articles", option)
		assert.NoError(t, err)
	} else {
		err = db.RunCommand(ctx, bson.D{
			{"collMod", "articles"},
			{"validator", jsonSchema},
			{"validationLevel", "strict"},
		}).Err()
		assert.NoError(t, err)
	}

	index := mongo.IndexModel{
		Keys: bson.D{{"key", 1}},
		Options: options.Index().
			SetUnique(true).
			SetName("idx_key"),
	}
	r, err := db.Collection("articles").Indexes().CreateOne(ctx, index)
	assert.NoError(t, err)
	t.Log(r)
}
