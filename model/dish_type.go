package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type DishType struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	ShopId     primitive.ObjectID `bson:"shop_id" json:"shop_id"`
	Sn         string             `bson:"sn" json:"sn"`
	Name       string             `bson:"name" json:"name"`
	Period     DishTypePeriod     `bson:"period" json:"period"`
	Status     bool               `bson:"status" json:"status"`
	CreateTime time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime time.Time          `bson:"update_time" json:"update_time"`
}

type DishTypePeriod struct {
	Enabled bool                 `bson:"enabled" json:"enabled"`
	Rules   []DishTypePeriodRule `bson:"rules" json:"rules"`
}

type DishTypePeriodRule struct {
	Name  string      `bson:"name" json:"name"`
	Value []time.Time `bson:"value" json:"value"`
}
