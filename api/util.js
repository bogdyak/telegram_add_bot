module.exports = {
    defineNumeration (str) {
        str = str.toLowerCase()
        let result = ""

        if (str.indexOf('sec') != -1)
            result = 'sec'
        
        if (str.indexOf('min') != -1)
            result = 'min'
        
        if (str.indexOf('hour') != -1)
            result = 'hour'
        
        if (str.indexOf('day') != -1)
            result = 'day'
        
        if (str.indexOf('week') != -1)
            result = 'week'
        
        if (str.indexOf('month') != -1)
            result = 'month'
        
        if (str.indexOf('year') != -1)
            result = 'year'

        return result
    },
}