package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Article struct {
	ID    primitive.ObjectID     `bson:"_id,omitempty" json:"_id"`
	Key   string                 `bson:"key" json:"key"`
	Value map[string]interface{} `bson:"value" json:"value"`
}
