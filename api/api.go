package api

import (
	"context"
	"github.com/bytedance/go-tagexpr/v2/binding"
	"github.com/bytedance/go-tagexpr/v2/validator"
	"github.com/bytedance/gopkg/util/logger"
	"github.com/bytedance/sonic/decoder"
	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/cloudwego/hertz/pkg/common/errors"
	"github.com/cloudwego/hertz/pkg/common/utils"
	"github.com/google/wire"
	"github.com/weplanx/rest/api/index"
	"github.com/weplanx/rest/common"
	"net/http"
)

var Provides = wire.NewSet(
	index.Provides,
)

type API struct {
	*common.Inject

	Hertz *server.Hertz
	Index *index.Controller
}

func (x *API) Routes(h *server.Hertz) (err error) {

	h.GET("", x.Index.Ping)
	r := h.Group("db/:collection")
	{
		r.POST("", x.Index.Create)
		r.POST("bulk_create", x.Index.BulkCreate)
		r.GET("_size", x.Index.Size)
		r.GET("", x.Index.Find)
		r.GET("_one", x.Index.FindOne)
		r.GET(":id", x.Index.FindById)
		r.PATCH("", x.Index.Update)
		r.PATCH(":id", x.Index.UpdateById)
		r.PUT(":id", x.Index.Replace)
		r.DELETE(":id", x.Index.Delete)
		r.POST("bulk_delete", x.Index.BulkDelete)
		r.POST("sort", x.Index.Sort)
	}
	h.POST("transaction", x.Index.Transaction)
	h.POST("commit", x.Index.Commit)

	return
}

//func (x *API) AccessLogs() app.HandlerFunc {
//	return func(ctx context.Context, c *app.RequestContext) {
//		now := time.Now()
//		c.Next(ctx)
//		method := string(c.Request.Header.Method())
//		if method == "GET" {
//			return
//		}
//		var userId string
//		if value, ok := c.Get("identity"); ok {
//			claims := value.(passport.Claims)
//			userId = claims.UserId
//		}
//		x.Transfer.Publish(context.Background(), "access", transfer.Payload{
//			Timestamp: now,
//			Data: map[string]interface{}{
//				"metadata": map[string]interface{}{
//					"method":    method,
//					"path":      string(c.Request.Path()),
//					"user_id":   userId,
//					"client_ip": c.ClientIP(),
//				},
//				"status":     c.Response.StatusCode(),
//				"user_agent": string(c.Request.Header.UserAgent()),
//			},
//			Format: map[string]interface{}{
//				"metadata.user_id": "oid",
//			},
//		})
//	}
//}

func (x *API) ErrHandler() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		c.Next(ctx)
		err := c.Errors.Last()
		if err == nil {
			return
		}

		if err.IsType(errors.ErrorTypePublic) {
			statusCode := http.StatusBadRequest
			result := utils.H{"message": err.Error()}
			if meta, ok := err.Meta.(map[string]interface{}); ok {
				if meta["statusCode"] != nil {
					statusCode = meta["statusCode"].(int)
				}
				if meta["code"] != nil {
					result["code"] = meta["code"]
				}
			}
			c.JSON(statusCode, result)
			return
		}

		switch e := err.Err.(type) {
		case decoder.SyntaxError:
			c.JSON(http.StatusBadRequest, utils.H{
				"code":    0,
				"message": e.Description(),
			})
			break
		case *binding.Error:
			c.JSON(http.StatusBadRequest, utils.H{
				"code":    0,
				"message": e.Error(),
			})
			break
		case *validator.Error:
			c.JSON(http.StatusBadRequest, utils.H{
				"code":    0,
				"message": e.Error(),
			})
			break
		default:
			logger.Error(err)
			c.Status(http.StatusInternalServerError)
		}
	}
}

func (x *API) Initialize(ctx context.Context) (h *server.Hertz, err error) {
	h = x.Hertz
	common.RegValidate()
	h.Use(x.ErrHandler())

	return
}
