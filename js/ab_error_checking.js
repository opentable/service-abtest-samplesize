// Check whether the conversion rate input is sensible
var conversion_rate_error_check = function(value) {
  // The value should be greater than 0 and less than or equal to 100
  if(value <= 0 || value > 100) {
    // If not sensible, show the error message and add an error to the input box
    $("#cr").css("display", "block");
    $("#conversion_rate").closest(".form-group").addClass("has-error");

    // return true to indicate an error exists
    return true;
  }
  return false;
}

// Check whether the expected effect input boxes are sensible
var expected_effect_error_check = function(min, max, value) {
  if(min <= 0 && max >= 0) {
    // The range of expected effects should not cross 0%, because then it will be impossible to figure out a sample size
    // If this error exists, show the error message and highlight the input boxes red
    $("#expected_effect_min").closest(".form-group").addClass("has-error");
    $("#expected_effect_max").closest(".form-group").addClass("has-error");
    $("#min_max_cross_0").css("display", "block");
    return true;
  } else if (min >= max) {
    // The minimum effect should not be greater than the maximum effect
    // If it is, show the error message and highlight the input boxes red
    $("#expected_effect_min").closest(".form-group").addClass("has-error");
    $("#expected_effect_max").closest(".form-group").addClass("has-error");
    $("#min_gt_max").css("display", "block");
    return true;
  } else if (min <= -100) {
    // The expected effect should not be less than -100%
    // If it is, show the error message and highlight the minimum effect input box red
    $("#expected_effect_min").closest(".form-group").addClass("has-error");
    $("#min_lt_100").css("display", "block");
    return true;
  } else {
    return false;
  }
}