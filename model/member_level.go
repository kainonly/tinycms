package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type MemberLevel struct {
	ID         primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	Name       string               `bson:"name" json:"name"`
	Code       string               `bson:"code" json:"code"`
	Discount   MemberLevelDiscount  `bson:"discount" json:"discount"`
	Upgrade    MemberLevelUpgrade   `bson:"upgrade" json:"upgrade"`
	Benefits   []primitive.ObjectID `bson:"benefits" json:"benefits"`
	Status     bool                 `bson:"status" json:"status"`
	CreateTime time.Time            `bson:"create_time" json:"create_time"`
	UpdateTime time.Time            `bson:"update_time" json:"update_time"`
}

type MemberLevelDiscount struct {
	Room   float64 `bson:"room" json:"room"`
	Dining float64 `bson:"dining" json:"dining"`
	Other  float64 `bson:"other" json:"other"`
}

type MemberLevelUpgrade struct {
	Mode   int64   `bson:"mode" json:"mode"`
	Amount float64 `bson:"amount" json:"amount"`
}
