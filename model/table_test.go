package model_test

import (
	"context"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"testing"
)

func TestCreateTablesCollection(t *testing.T) {
	ctx := context.TODO()
	b, err := os.ReadFile("./table.json")
	assert.NoError(t, err)
	var jsonSchema bson.D
	err = bson.UnmarshalExtJSON(b, true, &jsonSchema)
	assert.NoError(t, err)

	n, err := db.ListCollectionNames(ctx, bson.M{"name": "tables"})
	assert.NoError(t, err)
	if len(n) == 0 {
		option := options.CreateCollection().SetValidator(jsonSchema)
		err = db.CreateCollection(ctx, "tables", option)
		assert.NoError(t, err)
	} else {
		err = db.RunCommand(ctx, bson.D{
			{"collMod", "tables"},
			{"validator", jsonSchema},
			{"validationLevel", "strict"},
		}).Err()
		assert.NoError(t, err)
	}
}
