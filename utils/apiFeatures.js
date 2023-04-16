class APIFeatures {
    constructor(query, querystring) {
        this.query = query;
        this.querystring = querystring;
    }

    filter() {
        let q = { ...this.querystring };
        const excludedFields = ['page', 'order', 'sort', 'fields', 'limit'];
        excludedFields.forEach((e) => delete q[e]);

        let qStr = JSON.stringify(q);
        qStr = qStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

        this.query.find(JSON.parse(qStr));

        return this;
    }

    sort() {
        if (this.querystring.sort) {
            const sortBy = this.querystring.sort.split(',').join(' ');

            this.query = this.query.sort(sortBy)
        }

        return this;
    }

    limitFields() {
        if (this.querystring.fields) {
            const fields = this.querystring.fields.split(',').join(' ');

            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = +this.querystring.page || 1;
        const limit = +this.querystring.limit || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
