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

        // calculate distance from artillery to target
        var art_tar_dist = Math.sqrt(Math.pow(art_coord.x - tar_coord.x, 2) + Math.pow(art_coord.y - tar_coord.y, 2));
        // calculate azimuth from artiller to target
        var art_tar_deg = 0;
        if (art_tar_dist > 0) {
            art_tar_deg = to_degrees(Math.asin(Math.abs(tar_coord.x) / art_tar_dist));
        }

        // adjust degrees based on what quadrant the target is located relative to the artillery
        if (tar_coord.x < 0 && tar_coord.y >= 0) {
            // Target is in second quadrant
            art_tar_deg = 360 - art_tar_deg;
        }
        else if (tar_coord.x < 0 && tar_coord.y < 0) {
            // Target is in third quadrant
            art_tar_deg = 180 + art_tar_deg;
        }
        else if (tar_coord.x >= 0 && tar_coord.y < 0) {
            // Target is in fourth quadrant
            art_tar_deg = 180 - art_tar_deg;
        }

        if (isNaN(art_tar_dist) || isNaN(art_tar_deg)) {
            return {error: true};
        }

        return {art_tar_dist: art_tar_dist, art_tar_deg: art_tar_deg};
    };

    return inst;
}());