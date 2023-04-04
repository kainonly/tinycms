package main

import (
	"context"
	"github.com/weplanx/utils/helper"
	"server/bootstrap"
	"time"
)

func main() {
	values, err := bootstrap.LoadStaticValues()
	if err != nil {
		panic(err)
	}

	helper.RegValidate()

	switch values.Server {
	case "admin":
		api, err := bootstrap.InitializeAdmin(values)
		if err != nil {
			panic(err)
		}
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
		defer cancel()

		h, err := api.Initialize(ctx)
		if err != nil {
			panic(err)
		}

		if err = api.Routes(h); err != nil {
			panic(err)
		}

		h.Spin()
	case "api":
		api, err := bootstrap.InitializeAdmin(values)
		if err != nil {
			panic(err)
		}
		ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
		defer cancel()

		h, err := api.Initialize(ctx)
		if err != nil {
			panic(err)
		}

		if err = api.Routes(h); err != nil {
			panic(err)
		}

		h.Spin()
	}
}
