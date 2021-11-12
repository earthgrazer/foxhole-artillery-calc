var artycal = (function() {
    var inst = {};

    function azim_to_polar(azim_degrees) {
        // Polar coordinates are counterclockwise, so we convert to negative degrees for clockwise,
        // and offset 90 degrees because polar 0 deg is the positive x axis, whereas azimuth 0 deg is positive y axis
        return (azim_degrees - 90) * -1;
    }

    function to_radians(degrees) {
        return degrees * (Math.PI / 180);
    }

    function to_degrees(radians) {
        return radians * (180 / Math.PI);
    }

    function azim_to_cart(dist, azim) {
        // Convert distance and azimuth to cartesian coordinates
        var polar_deg = to_radians(azim_to_polar(azim));
        return {x: dist * Math.cos(polar_deg), y: dist * Math.sin(polar_deg)};
    }

    function get_translate_matrix(coords) {
        return {x: -coords.x, y: -coords.y};
    }

    function apply_translate(coords, matrix) {
        coords.x += matrix.x;
        coords.y += matrix.y;
    }

    inst.get_backcourse = function(degrees) {
        return (degrees >= 180)? degrees-180 : degrees+180;;
    }
    
    // Calculate the length of the opposite angles side
    // (ie: how long is the offset given an specific angle?)
    inst.getOpAngleDist = function(distance, degrees) {
        return distance * Math.tan(to_radians(degrees));
    }
    
    // Calculate correction angle needed for a given dist
    // (i.e. how many degrees to rotate to hit a corrected position)
    inst.getCorrectionAngle = function(distanceToTGT, leftRightCorrection) {
        return to_degrees(Math.atan(leftRightCorrection / distanceToTGT));
    }

    /**
     * Foxhole only allows distance adjustments in 5 meter increments. Round number to the nearest multiple of five.
     * @param num Number to round
     * @returns {number}
     */
    inst.roundTo5 = function(num) {
        var ceil = Math.ceil(num / 5) * 5;
        var floor = Math.floor(num / 5) * 5;

        if (Math.abs(num - ceil) > Math.abs(num - floor)) {
            return floor;
        }
        else {
            return ceil;
        }
    };
    
    /**
     * Compute polar vector
     * 
     * @returns {dist:dist, azim:azim}
     */
    inst.cartesianToPolar = function(xa, ya, xb, yb) {
        // calculate distance from artillery to target
        var dist = Math.sqrt(Math.pow(xa - xb, 2) + Math.pow(ya - yb, 2));
        // calculate azimuth from artiller to target
        var azim = 0;
        if (dist > 0) {
            azim = to_degrees(Math.asin(Math.abs(xb) / dist));
        }

        // adjust degrees based on what quadrant the target is located relative to the artillery
        if (xb < 0 && yb >= 0) {
            // Target is in second quadrant
            azim = 360 - azim;
        }
        else if (xb < 0 && yb < 0) {
            // Target is in third quadrant
            azim = 180 + azim;
        }
        else if (xb >= 0 && yb < 0) {
            // Target is in fourth quadrant
            azim = 180 - azim;
        }

        if (isNaN(dist) || isNaN(azim)) {
            return {error: true};
        }

        return {dist:dist, azim:azim};
    }

    /**
     * Compute distance and azimuth from artillery to target given location information relative to a spotter.
     * @param tar_dist Target distance from spotter
     * @param tar_azim Target azimuth from spotter
     * @param art_dist Artillery distance from spotter
     * @param art_azim Artillery azimuth from spotter
     * @returns {{art_tar_dist: number, art_tar_deg: number}}
     */
    inst.calc_artillery = function(tar_dist, tar_azim, art_dist, art_azim) {
        if (isNaN(tar_dist) || isNaN(tar_azim) || isNaN(art_dist) || isNaN(art_azim)) {
            return {error: true};
        }

        // convert polar coordinates of target and artillery to cartesian
        var tar_coord = azim_to_cart(tar_dist, tar_azim);
        var art_coord = azim_to_cart(art_dist, art_azim);

        // transform cartesian coordinates to have the artillery as origin
        var translate_origin = get_translate_matrix(art_coord);
        apply_translate(tar_coord, translate_origin);
        apply_translate(art_coord, translate_origin);
        
        // calculate distance and azimuth from the arty to its target
        var result = inst.cartesianToPolar(art_coord.x, art_coord.y, tar_coord.x, tar_coord.y);
        return {art_tar_dist: result.dist, art_tar_deg: result.azim};
    };

    return inst;
}());
