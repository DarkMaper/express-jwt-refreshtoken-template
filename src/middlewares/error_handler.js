import error_types from '../libs/error_types';

export default function errorHandler (error, req, res, next) {
    if(error instanceof error_types.InfoError)
        res.status(200).json({error: error.message});
    else if(error instanceof error_types.CONFLICT)
        res.status(409).json({error: error.message});
    else if(error instanceof error_types.NOT_FOUND)
        res.status(404).json({error: error.message});
    else if(error instanceof error_types.FORBIDDEN)
        res.status(403).json({error: error.message});
    else if(error instanceof error_types.UNAUTHORIZED)
        res.status(401).json({error: error.message});
    else if(error.name == "ValidationError") //de mongoose
        res.status(200).json({error: error.message});
    else if(error.message || error instanceof error_types.INTERNAL_ERROR)
        res.status(500).json({error: error.message});
    else
        next();
}