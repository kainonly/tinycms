package main

import (
	"context"
	"github.com/weplanx/rest/bootstrap"
	"github.com/weplanx/rest/common"
	"time"
)

func main() {
	values, err := bootstrap.LoadStaticValues()
	values.Options = new(common.Options)
	if err != nil {
		panic(err)
	}
	api, err := bootstrap.NewAPI(values)
	if err != nil {
		panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	h, err := api.Initialize(ctx, false)
	if err != nil {
		panic(err)
	}
	if err = api.Routes(h); err != nil {
		panic(err)
	}
	h.Spin()
}
