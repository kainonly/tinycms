package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type User struct {
	ID         primitive.ObjectID   `bson:"_id,omitempty" json:"_id"`
	Email      string               `bson:"email" json:"email"`
	Password   string               `bson:"password" json:"-"`
	Roles      []primitive.ObjectID `bson:"roles" json:"-"`
	Name       string               `bson:"name" json:"name"`
	Avatar     string               `bson:"avatar" json:"avatar"`
	Status     bool                 `bson:"status" json:"status"`
	CreateTime time.Time            `bson:"create_time" json:"create_time"`
	UpdateTime time.Time            `bson:"update_time" json:"update_time"`
}

func NewUser(email string, password string) *User {
	return &User{
		Email:      email,
		Password:   password,
		Roles:      []primitive.ObjectID{},
		Status:     true,
		CreateTime: time.Now(),
		UpdateTime: time.Now(),
	}
}
