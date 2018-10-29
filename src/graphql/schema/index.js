import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLFloat
} from "graphql/type"

import { Report } from "../../api/report"

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */
export function getProjection(fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce(
    (projections, selection) => {
      projections[selection.name.value] = true
      return projections
    },
    {}
  )
}

const ReportType = new GraphQLObjectType({
  name: "Report",
  description: "Report item",
  fields: () => ({
    id: { type: GraphQLString },
    userID: { type: GraphQLString },
    latitude: { type: GraphQLFloat },
    longitude: { type: GraphQLFloat },
    description: { type: GraphQLString },
    category: { type: GraphQLString },
    confirmations: { type: GraphQLInt },
    fixed: { type: GraphQLBoolean },
    extra: { type: GraphQLString }
  })
})

const Reports = {
  type: new GraphQLList(ReportType),
  resolve: (root, { id }, source, fieldASTs) => {
    const projections = getProjection(fieldASTs)
    const foundItems = new Promise((resolve, reject) => {
      Report.find({}, projections, (err, todos) => {
        err ? reject(err) : resolve(todos)
      })
    })

    return foundItems
  }
}

const ReportById = {
  type: new GraphQLList(ReportType),
  args: {
    id: {
      name: "id",
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: (root, { id }, source, fieldASTs) => {
    const projections = getProjection(fieldASTs)
    const foundItems = new Promise((resolve, reject) => {
      Report.find({ _id: id }, projections, (err, todos) => {
        err ? reject(err) : resolve(todos)
      })
    })

    return foundItems
  }
}

const RedAlertQueryRootType = new GraphQLObjectType({
  name: "RedAlertAppSchema",
  fields: {
    reports: Reports,
    report: ReportById
  }
})

const RedAlertAppSchema = new GraphQLSchema({
  query: RedAlertQueryRootType
})

export default RedAlertAppSchema
