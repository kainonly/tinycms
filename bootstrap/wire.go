//go:build wireinject
// +build wireinject

package bootstrap

import (
	"github.com/google/wire"
	"rest-demo/api"
	"rest-demo/common"
)

func NewAPI(values *common.Values) (*api.API, error) {
	wire.Build(
		wire.Struct(new(api.API), "*"),
		wire.Struct(new(common.Inject), "*"),
		UseMongoDB,
		UseDatabase,
		UseRedis,
		UseNats,
		UseJetStream,
		UseKeyValue,
		UseHertz,
		api.Provides,
	)
	return &api.API{}, nil
}
