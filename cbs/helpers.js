function parseQueryParams(queryParams) {
  if (!queryParams) return queryParams
  if (!queryParams.datePeriod) return queryParams
  const fromTimestamp = (!!queryParams.datePeriod.fromTime) ? new Date(queryParams.datePeriod.fromTime * 1000) : new Date(1)
  if (fromTimestamp.getTime() < 0) {
    throw('invalid `fromTime` parameter passed to function')
  }
  const toTimestamp = (!!queryParams.datePeriod.toTime) ? new Date(queryParams.datePeriod.toTime * 1000) : new Date(new Date() + 10000000)
  if (toTimestamp.getTime() < 0) {
    throw('invalid `toTime` parameter passed to function')
  }
  return {
    ...queryParams,
    datePeriod: [fromTimestamp.toISOString(), toTimestamp.toISOString()]
  }
}

module.exports = {
  parseQueryParams
}
