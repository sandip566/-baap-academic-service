const jwt = require('jsonwebtoken');

class TokenService {

    static isAdmin(decodedToken) {
        return decodedToken.role && decodedToken.role.name.toLowerCase().includes("admin");
    }

    static getIndividualPermissions(decodedToken) {
        const permissionsArray = decodedToken.role.permissions.reduce((acc, permission) => {
            acc.push(...permission.split(','));
            return acc;
        }, []);
        return permissionsArray;
    }

    static hasAllowedAction(decodedToken, allowedActions) {
        const individualPermissions = TokenService.getIndividualPermissions(decodedToken);
        console.log("individualPermissions", individualPermissions);

        let decodedTokenData = decodedToken.role && allowedActions.every(actions => {
            const permissions = actions.split(',');
            return permissions.every(permission => individualPermissions.includes(permission.trim()));
        });
        console.log("allow Actions", allowedActions);
        console.log("decodedTokenData", decodedTokenData);

        return decodedTokenData;
    }

    static isAuthenticated(req) {
        const token = req.headers.authorization;
        return !!token;
    }

    static checkQueryParams(req) {
        const { userId, name, phoneNumber, servicerequestId, year, month, orderId, categoryId, status, search } = req.query;
        return (userId || name || phoneNumber || servicerequestId || year || orderId || month || categoryId || status || search);
    }

    static checkPermission(allowedActions) {
        return async (req, res, next) => {
            if (!TokenService.isAuthenticated(req)) {
                return res.status(401).json({ message: "Invalid token, you do not have access to call this" });
            }
            try {
                const decodedToken = await TokenService.decodeToken(req.headers.authorization);
                console.log("decodedToken", decodedToken);
                const hasPermission = TokenService.isAdmin(decodedToken)
                    ? TokenService.hasAllowedAction(decodedToken, allowedActions)
                    : TokenService.hasAllowedAction(decodedToken, allowedActions) && TokenService.checkQueryParams(req);

                console.log("hasPermission", hasPermission);
                if (hasPermission) {
                    next();
                } else {
                    return res.status(403).json({ message: "You do not have permission to Perform this Action" });
                }
            } catch (error) {
                console.log(error);
                return res.status(500).json({ message: "Token verification failed" });
            }
        };
    }

    // static async decodeToken(token) {
    //     try {
    //         const decoded = jwt.verify(token, process.env.API_SECRET);
    //         console.log(decoded);
    //         return decoded;
    //     } catch (error) {
    //         console.error('Token verification error:', error.message);
    //         throw new Error('Token verification failed');
    //     }
    // }

    static async decodeToken(token) {
        try {
            console.log("Token received:", token);
            const decoded = jwt.verify(token, process.env.API_SECRET);
            console.log("Decoded token:", decoded);
            return decoded;
        } catch (error) {
            console.error('Token verification error:', error.message);
            throw new Error('Token verification failed');
        }
    }
}

module.exports = TokenService;