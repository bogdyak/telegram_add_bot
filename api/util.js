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

    numerationInMilseconds (x, numeration) {
        let result = ""

        switch (numeration) {
            case 'sec' :
                result = x * 1000
                break

            case 'min' :
                result = x * 60000
                break

            case 'hour' :
                result = x * 3600000
                break

            case 'day' :
                result = x * 86400000
                break

            case 'week' :
                result = x * 604800000
                break

            case 'month' :
                result = x * 2592000000
                break

            case 'year' :
                result = x * 31536000000
                break
        }

        return result
    }
}