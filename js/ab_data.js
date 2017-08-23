var get_data = function(inputs) {
  var base_cr = inputs['slider_base_val'] / 100;
  var variant_effect = inputs['slider_variant_val'] / 100;
  var pct_base = inputs['slider_pct_base_val'] / 100;
  var abs_rel = inputs['absolute_relative_radio'];
  if (abs_rel == "Absolute") {
    var variant_cr = base_cr + variant_effect;
    var variant_cr_min = base_cr + variant_effect / 2;
    var variant_cr_max = Math.min(.999, base_cr + 3 * variant_effect / 2);
  } else {
    var variant_cr = base_cr * (1 + variant_effect);
    var variant_cr_min = base_cr + variant_effect * base_cr / 2;
    var variant_cr_max = Math.min(.999, base_cr + 3 * variant_effect * base_cr / 2);

  }

  var increment_size = (variant_cr_max - variant_cr_min) / 500;

  var generate_data = function(significance_stat) {
    var data = [];
    var i = 1;

    data[0] = {"variant_cr": variant_cr_min, "sample_size": generate_sample_size(variant_cr_min, significance_stat)};

    while (data[i - 1]["variant_cr"] < variant_cr_max) {
      var variant_cr_incremented = data[i - 1]["variant_cr"] + increment_size;
      data[i] = {"variant_cr": variant_cr_incremented, "sample_size": generate_sample_size(variant_cr_incremented, significance_stat)};
      i += 1;
    };
    return data;
  };

  var compute_g_stat = function(variant_cr) {
    // This function computes the necessary g-test statistic required to get significance given an expected effect, conversion rate, and significance level

    // The sample size
    var n = 1;
    // We assume that the base and variant each get half of the sample
    var n_base = n * pct_base;
    var n_variant = n * (1 - pct_base);

    // The observed number of bookings in the base case are the number of visitors who convert, i.e. book, times the number of people in the base group
    var observed_base_booked = base_cr * n_base;
    // The observed number of bookings in the variant case are the number of visitors who convert, i.e. book, times the number of people in the variant group,
    // times the variant effect, i.e. the expected effect of the treatment
    var observed_variant_booked = variant_cr * n_variant;

    // The observed number of non-bookings in the base case is whatever is left over that wasn't booked. Same for the variant case.
    var observed_base_not_booked = n_base - observed_base_booked;
    var observed_variant_not_booked = n_variant - observed_variant_booked;

    // The total number of bookings and non-bookings
    var booked_total = observed_base_booked + observed_variant_booked;
    var not_booked_total = observed_base_not_booked + observed_variant_not_booked;

    // The expected bookings in the base/variant case is the total number of people in the base/variant group times the probability that a booking is made
    var expected_base_booked = n_base * booked_total / n;
    var expected_variant_booked = n_variant * booked_total / n;
    var expected_base_not_booked = n_base * not_booked_total / n;
    var expected_variant_not_booked = n_variant * not_booked_total / n;

    // The 
    var g_test_stat = 2 * (observed_base_booked * Math.log(observed_base_booked / expected_base_booked) + observed_base_not_booked * Math.log(observed_base_not_booked / expected_base_not_booked) + observed_variant_booked * Math.log(observed_variant_booked / expected_variant_booked) + observed_variant_not_booked * Math.log(observed_variant_not_booked / expected_variant_not_booked))
    return g_test_stat;
  }

  var generate_sample_size = function(variant_conversion, test_stat) {
    // Get the g test statistic
    var g_test_stat = compute_g_stat(variant_conversion)
    // Return the ratio of the required test statistic and the g test statistic that we computed based on a sample size of 1
    return test_stat / g_test_stat;
  }

  var agg_data = {
    "significance_1" : {
      "stat" : 6.63,
      "data": [],
      "base_cr": base_cr,
      "variant_cr": variant_cr,
      "variant_effect": variant_effect,
      "sample_size": 6.63 / compute_g_stat(variant_cr),
      "pct_base": pct_base
    },
    "significance_5" : {
      "stat" : 3.84,
      "data": [],
      "base_cr": base_cr,
      "variant_cr": variant_cr,
      "variant_effect": variant_effect,
      "sample_size": 3.84 / compute_g_stat(variant_cr),
      "pct_base": pct_base
    },
    "significance_10" : {
      "stat" : 2.71,
      "data": [],
      "base_cr": base_cr,
      "variant_cr": variant_cr,
      "variant_effect": variant_effect,
      "sample_size": 2.71 / compute_g_stat(variant_cr),
      "pct_base": pct_base
    }
  };

  $.each(agg_data, function(key, value) {
    agg_data[key]["data"] = generate_data(value["stat"])
  });

  return agg_data;
}


