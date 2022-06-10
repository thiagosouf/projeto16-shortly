export function validateSchema(schema) {
    return function (req, res, next) {
        const result = schema.validate(req.body);
        if (result.error) {
            res.status(422).send(result.error.details[0].message);
        }
        else {
            next();
        }
    }
}