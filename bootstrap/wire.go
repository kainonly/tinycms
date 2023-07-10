//go:build wireinject
// +build wireinject

package bootstrap

import (
	"github.com/google/wire"
	"github.com/weplanx/rest/api"
	"github.com/weplanx/rest/common"
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
