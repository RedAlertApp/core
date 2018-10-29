import {
  GraphQLObjectType,
  GraphQLInputObjectType,
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

const ReportInputType = new GraphQLInputObjectType({
  name: "ReportInput",
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

const CreateReport = {
  type: ReportType,
  args: {
    report: { type: ReportInputType }
  },
  resolve: (value, { report }) => {
    let newReport = new Report({
      userID: report.userID,
      latitude: report.latitude,
      longitude: report.longitude,
      description: report.description,
      category: report.category,
      confirmations: report.confirmations,
      extra: report.extra
    })
    const savedReport = new Promise((resolve, reject) => {
      newReport.save((err, report) => {
        err ? reject(err) : resolve(report)
      })
    })

    return savedReport
  }
}

const RedAlertQueryRootType = new GraphQLObjectType({
  name: "RedAlertAppSchemaQuery",
  fields: {
    reports: Reports,
    report: ReportById
  }
})

const RedAlertMutationRootType = new GraphQLObjectType({
  name: "RedAlertAppSchemaMutation",
  fields: {
    createReport: CreateReport
  }
})

const RedAlertAppSchema = new GraphQLSchema({
  query: RedAlertQueryRootType,
  mutation: RedAlertMutationRootType
})

export default RedAlertAppSchema
