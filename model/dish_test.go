package model_test

import (
	"context"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"testing"
)

func TestCreateDishesCollection(t *testing.T) {
	ctx := context.TODO()
	b, err := os.ReadFile("./dish.json")
	assert.NoError(t, err)
	var jsonSchema bson.D
	err = bson.UnmarshalExtJSON(b, true, &jsonSchema)
	assert.NoError(t, err)

	n, err := db.ListCollectionNames(ctx, bson.M{"name": "dishes"})
	assert.NoError(t, err)
	if len(n) == 0 {
		option := options.CreateCollection().SetValidator(jsonSchema)
		err = db.CreateCollection(ctx, "dishes", option)
		assert.NoError(t, err)
	} else {
		err = db.RunCommand(ctx, bson.D{
			{"collMod", "dishes"},
			{"validator", jsonSchema},
			{"validationLevel", "strict"},
		}).Err()
		assert.NoError(t, err)
	}
}
