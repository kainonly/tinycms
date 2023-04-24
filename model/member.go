package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type Member struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	LevelId    primitive.ObjectID `bson:"level_id" json:"level_id"`
	Cardno     string             `bson:"cardno" json:"cardno"`
	Profile    MemberProfile      `bson:"profile" json:"profile"`
	Points     int64              `bson:"points" json:"points"`
	Balance    float64            `bson:"balance" json:"balance"`
	Spending   float64            `bson:"spending" json:"spending"`
	Location   MemberLocation     `bson:"location" json:"location"`
	Source     string             `bson:"source" json:"source"`
	Status     bool               `bson:"status" json:"status"`
	CreateTime time.Time          `bson:"create_time" json:"create_time"`
	UpdateTime time.Time          `bson:"update_time" json:"update_time"`
}

type MemberProfile struct {
	Name     string    `bson:"name" json:"name"`
	Phone    string    `bson:"phone" json:"phone"`
	Gender   string    `bson:"gender" json:"gender"`
	Avatar   string    `bson:"avatar" json:"avatar"`
	Birthday time.Time `bson:"birthday" json:"birthday"`
}

type MemberLocation struct {
	Country  string `bson:"country" json:"country"`
	Province string `bson:"province" json:"province"`
	City     string `bson:"city" json:"city"`
}
