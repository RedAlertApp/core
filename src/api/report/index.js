import { Router } from "express"
import { middleware as query } from "querymen"
import { middleware as body } from "bodymen"
import { token } from "../../services/passport"
import { create, index, show, update, destroy } from "./controller"
import { schema } from "./model"
export Report, { schema } from "./model"

const router = new Router()
const {
  userID,
  latitude,
  longitude,
  description,
  category,
  confirmations,
  fixed,
  extra
} = schema.tree

/**
 * @api {post} /reports Create report
 * @apiName CreateReport
 * @apiGroup Report
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam userID Report's userID.
 * @apiParam latitude Report's latitude.
 * @apiParam longitude Report's longitude.
 * @apiParam description Report's description.
 * @apiParam category Report's category.
 * @apiParam confirmations Report's confirmations.
 * @apiParam fixed Report's fixed.
 * @apiParam extra Report's extra.
 * @apiSuccess {Object} report Report's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Report not found.
 * @apiError 401 user access only.
 */
router.post(
  "/",
  token({ required: true }),
  body({
    userID,
    latitude,
    longitude,
    description,
    category,
    confirmations,
    fixed,
    extra
  }),
  create
)

/**
 * @api {get} /reports Retrieve reports
 * @apiName RetrieveReports
 * @apiGroup Report
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiUse listParams
 * @apiSuccess {Number} count Total amount of reports.
 * @apiSuccess {Object[]} rows List of reports.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 401 admin access only.
 */
router.get(
  "/",
  token({ required: true, roles: ["admin", "user"] }),
  query(),
  index
)

/**
 * @api {get} /reports/:id Retrieve report
 * @apiName RetrieveReport
 * @apiGroup Report
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess {Object} report Report's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Report not found.
 * @apiError 401 admin access only.
 */
router.get("/:id", token({ required: true, roles: ["admin", "user"] }), show)

/**
 * @api {put} /reports/:id Update report
 * @apiName UpdateReport
 * @apiGroup Report
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiParam userID Report's userID.
 * @apiParam latitude Report's latitude.
 * @apiParam longitude Report's longitude.
 * @apiParam description Report's description.
 * @apiParam category Report's category.
 * @apiParam confirmations Report's confirmations.
 * @apiParam fixed Report's fixed.
 * @apiParam extra Report's extra.
 * @apiSuccess {Object} report Report's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Report not found.
 * @apiError 401 admin access only.
 */
router.put(
  "/:id",
  token({ required: true, roles: ["admin"] }),
  body({
    userID,
    latitude,
    longitude,
    description,
    category,
    confirmations,
    fixed,
    extra
  }),
  update
)

/**
 * @api {delete} /reports/:id Delete report
 * @apiName DeleteReport
 * @apiGroup Report
 * @apiPermission admin
 * @apiParam {String} access_token admin access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Report not found.
 * @apiError 401 admin access only.
 */
router.delete("/:id", token({ required: true, roles: ["admin"] }), destroy)

export default router
