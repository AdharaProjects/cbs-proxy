function checkParams(givenParams, requiredParams){
  return new Promise(function(resolve, reject){
    let givenParamList = Object.keys(givenParams)
    for(let i in requiredParams){
      if(givenParamList.includes(requiredParams[i]) === false){
        reject(Error('Required parameter ' + requiredParams[i] + ' missing from API call'))
        break
      }
    }
    resolve(true)
  })
}

module.exports = {
  checkParams
}
