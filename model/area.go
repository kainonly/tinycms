package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Area struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	ShopId     primitive.ObjectID `bson:"shop_id" json:"shop_id"`
	Name       string             `bson:"name" json:"name"`
	Tea        AreaTea            `bson:"tea" json:"tea"`
	Status     bool               `bson:"status" json:"status"`
	CreateTime time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime time.Time          `bson:"update_time" json:"update_time"`
}

type AreaTea struct {
	Fee     float64 `bson:"fee" json:"fee"`
	Service float64 `bson:"service" json:"service"`
	Tax     float64 `bson:"tax" json:"tax"`
}
