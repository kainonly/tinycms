package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type MemberLevel struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name       string             `bson:"name" json:"name"`
	Points     MemberLevelPoints  `bson:"points" json:"points"`
	Discount   float64            `bson:"discount" json:"discount"`
	Status     bool               `bson:"status" json:"status"`
	CreateTime time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime time.Time          `bson:"update_time" json:"update_time"`
}

type MemberLevelPoints struct {
	Initial float64 `bson:"initial" json:"initial"`
	Upgrade float64 `bson:"upgrade" json:"upgrade"`
}
