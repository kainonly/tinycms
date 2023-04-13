package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type DishType struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	RestaurantId primitive.ObjectID `bson:"restaurant_id" json:"restaurant_id"`
	Sn           string             `bson:"sn" json:"sn"`
	Name         string             `bson:"name" json:"name"`
	Period       DishTypePeriod     `bson:"period" json:"period"`
}

type DishTypePeriod struct {
	Enabled bool                 `bson:"enabled" json:"enabled"`
	Rules   []DishTypePeriodRule `bson:"rules" json:"rules"`
}

type DishTypePeriodRule struct {
	Name  string      `bson:"name" json:"name"`
	Value []time.Time `bson:"value" json:"value"`
}
