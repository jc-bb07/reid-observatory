/* ==========================================================================
 * sim_p6.js — Isle of Man system-dynamics model, calibration PASS 6
 *
 * PROVENANCE: direct JavaScript port of model_p6.py sim() with the fitted
 * parameter set params_p6.json (72 free parameters, calibrated 16 Aug 2026,
 * staged fit, final cost 7.5654; single clean run, no Jersey warm-starts).
 * Pass-6 structure: verified Manx real-GDP aggregate target; EG0 = 1.0;
 * persistence-form cost wedge  drag = s * (W - trailing-5yr-mean(W));
 * three revenue regimes (Common Purse loop <= 2008; 2009-2015 customs
 * IMPOSED from observed C&E outturns — sliders cannot move that window;
 * FERSA 2016+ = s3 x trailing-5yr mean of the nominal base); XN
 * income-spillover channel psi_sp. Targets verified 2,678/2,678 cells.
 *
 * Parity: reproduces the Python reference trajectories 1998-2024 to
 * ~1e-12 % on all 48 output series (see parity.js / PORT_NOTES.md).
 * All parameters and exogenous arrays are embedded at full float
 * precision (shortest-round-trip JSON from the Python source).
 *
 * History 1998-2024 is the calibrated baseline; levers apply from 2025;
 * horizon 2035 with flat drivers (CPI 2 %/yr, policy rate 4 %, UK real
 * growth 1.4 %/yr, UK finance growth 1 %/yr, e-gaming promotion 0.25).
 *
 * Dependency-free. Loads as a plain <script> tag (defines window.simP6)
 * and as a CommonJS module (module.exports.simP6). NOT an ES module.
 *
 * API:
 *   simP6(levers) -> { years: [1998..2035], <series>: number[38], ... }
 *   levers (all optional):
 *     housebuild : completions multiplier from 2025 (default 1)
 *     sector     : 'egaming' | 'none' — which sector promotion targets
 *                  from 2025 (default 'egaming'; e-gaming is the only
 *                  promotion channel the calibrated model has)
 *     promo      : promotion intensity 0..1 from 2025 (default 0.25,
 *                  the baseline assumption; ignored when sector==='none',
 *                  which sets promotion to 0 from 2025)
 *     migration  : openness multiplier on the vacancy-driven worker
 *                  in-flow from 2025 (default 1)
 * ========================================================================== */
(function (global) {
  "use strict";

  var DATA = {"meta":{"pass":6,"calibrated":"2026-08-16","final_cost":7.5654,"free_params":72,"source":"model_p6.py + params_p6.json","lever_start_year":2025},"years":[1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035],"params":{"sx_s":0.7101494645921385,"sx_n":0.4417667525660343,"phi_inc":0.3786918532554947,"lxn":12.165518992283324,"lxs":17.570223397695685,"prod_xn":0.03342392410553993,"prod_xs":0.015758196015174288,"lf":7.211330737473031,"lf_bi":4.770160173885984,"prod_f":0.047728981713715264,"le_eg":1.9628516149279567,"kappa":2.698968239336848,"sx_s_lvl":0.01464918619847372,"g_f_eph":0.05778368670634092,"s_f_eph":0.046185580724490895,"g_f0":0.02786054903131562,"b_uk":0.109579116964384,"psi_sp":0.7519726850198942,"g_xn":0.03297111066777275,"s1_0":0.06519984834693072,"k_vat":0.04093537158573161,"s3":0.03333160497285368,"g_eg":0.7999999999956591,"EG_max":450.1043263957765,"decay_eg":0.00513878685535064,"lg_down":0.0002310206426726505,"r_down":0.012476591978531355,"beta_lg":0.31603465559829813,"a_wa":0.7539649256397235,"r_AO":0.015397183627625875,"br0":0.018193652505411467,"br_tr":-0.03588818135598812,"dr0":0.061452697356885015,"dr_tr":-0.016172434322460537,"in0":1448.7826335084935,"in1":2917.7572318696393,"out0":1497.1272677343975,"out1":3910.138567106028,"out2":9.97621286619062e-11,"out3":7696.6811311740885,"nlm0":959.9765184945104,"rev0":503.6822519711338,"w1":1.199669293446607,"w2":0.3890208637265496,"conv":0.29569390615153535,"s_f":0.39999985652340836,"hp0":145050.89085946992,"eta_d":3.511227533919046,"mrg":7.23536304099656e-05,"cpen_eg":0.10207830497057152,"tau_pr":2.4981489075415975,"tau_hp":1.3168654255201777,"c0":215.0505960317014,"c1":5928.73538740343,"tau_lg":6.014610222252121,"R_floor":1.8903299792419588,"v_ref":-0.011490883407703266,"whi0":450.26166204961675,"wmd0":365.0446294023382,"wlo0":265.7862908917489,"prem":0.8016438085094049,"catch":0.027832485364954213,"tau0":0.14617147900757219,"prog":0.0005454658839271553,"nr0":33.69322870402937,"ni_rate":0.1170653742562875,"oncost":1.44431116914937,"pen0":10.295605262176137,"RP0":4809.809374999912,"alpha":0.7518865575229198,"r_int":0.03598961569898221,"d_rate":0.09999980978628882},"fixed":{"C0":14300.0,"A0":46800.0,"O0":12900.0,"fert_break":2008,"H0":35000.0,"Lg0":8450.0,"F_OUT0":1202.2009481048078,"XS0":239.2460687845055,"XEG0":983.7167987172481,"EG0":1.0,"gov_prod":0.014450199131129477,"gov_drift":0.0125,"rent_pd":0.01442,"rent_drift":0.0135,"R0":1000.0,"demolitions":60.0,"tau_S":1.5,"vat_share_cap_year":2006,"erosion_2007":0.045,"hire_cap":0.05,"phi_w":0.5,"draw_start":2012,"phi_pop":1.0,"in_share":[0.05,0.9,0.05],"out_share":[0.03,0.92,0.05],"nlm_share":[0.05,0.6,0.35],"nlm_decay":0.85,"nlm_break":2008,"death_share_A":0.1,"ret_rate":0.03,"mort_rp":0.03,"agency_income":43.0},"split_year":2007,"eph_share_0":0.34836082821491055,"k_wedge":5,"rate_ref":3.0,"misc_jobs":2000.0,"mlt_lo":[0.66,0.83,0.98,1.14,1.39],"mlt_md":[0.76,0.89,1.0,1.1,1.25],"mlt_hi":[0.55,0.74,0.94,1.2,1.57],"infl":[0.0,1.3,0.8,1.2,1.3,1.4,1.3,2.1,2.3,2.3,3.6,2.2,3.3,4.5,2.8,2.6,1.5,0.0,0.7,2.7,2.5,1.8,0.9,2.6,9.1,7.3,2.5,3.2,2.2,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0,2.0],"rate":[7.2,5.5,6.0,5.1,4.0,3.7,4.4,4.6,4.6,5.5,4.7,0.6,0.5,0.5,0.5,0.5,0.5,0.5,0.4,0.3,0.6,0.75,0.2,0.1,1.5,4.7,5.0,4.3,4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0,4.0],"g_uk":[0.0,0.029000000000000137,0.04664723032069973,0.0241411327762302,0.015412511332729029,0.03214285714285703,0.019896193771626436,0.031382527565733565,0.023026315789473673,0.029742765273311766,0.0007806401249024209,-0.04524180967238678,0.025326797385620825,0.007968127490039834,0.017391304347825987,0.017094017094017255,0.031321619556913705,0.020000000000000018,0.023238925199709604,0.03051809794180249,0.01515151515151536,0.013568521031207537,0.015,0.015,0.04700272479564016,0.004,0.009,0.012,0.014,0.014,0.014,0.014,0.014,0.014,0.014,0.014,0.014,0.014],"g_ukf":[0.0,-0.013000000000000012,0.05673758865248213,-0.016299137104506256,0.04483430799220289,0.0326492537313432,0.030713640469737902,0.13935144609991235,-0.026153846153846194,0.2551342812006321,0.0018879798615480947,-0.06281407035175879,-0.0160857908847184,-0.053814713896457755,0.011519078473722022,-0.04982206405693945,-0.006741573033707926,-0.04751131221719451,0.07521773555027722,0.07363770250368185,-0.023319615912208547,-0.02949438202247201,-0.024602026049203918,0.03931750741839757,-0.01498929336188437,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01,0.01],"promo":[0.1,0.1,0.1,0.1,0.1,0.1,0.325,0.55,0.775,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.88,0.76,0.64,0.52,0.4,0.4,0.4,0.4,0.4,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25,0.25],"covid_out":[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.08,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0],"covid_customs":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.88,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],"covid_mig":[1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,0.3,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],"customs_imposed":{"2009":372.9,"2010":350.0,"2011":366.4,"2012":296.0,"2013":312.0,"2014":319.7,"2015":355.0},"obs":{"manx_gdp_idx":{"1998":100.0,"1999":113.7,"2000":119.7261,"2001":126.19130940000001,"2002":134.0151705828,"2003":142.05608081776802,"2004":149.44299702029195,"2005":158.26013384448916,"2006":170.44616415051482,"2007":183.22962646180343,"2008":191.8414189055082,"2009":195.87008870252384,"2010":202.52967171840967,"2011":206.58026515277788,"2012":213.19083363766677,"2013":222.78442115136176,"2014":233.92364220892986,"2015":231.8183294290495,"2016":248.97288580679918,"2017":257.935909695844,"2018":262.836691980065,"2019":263.09952867204504,"2020":242.05156637828145,"2021":250.28131963514303,"2022":237.76725365338586,"2023":231.8230723120512},"customs":{"years":[1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023],"values":[155.9,183.3,221.9,299.9,251.6,306.2,325.8,369.2,438.5,429.9,408.5,372.9,350.0,366.4,296.0,312.0,319.7,355.0,348.5,358.7,369.7,444.5,328.4,390.2,443.1,441.7]},"house_price_official":{"2011":250000.0,"2012":244300.0,"2013":239500.0,"2014":242375.0,"2015":249362.5,"2016":247987.5,"2017":249181.25,"2018":252937.5,"2019":260112.5,"2020":272556.25,"2021":299487.5,"2022":340868.75,"2023":349875.0,"2024":349493.75,"2025":353231.25}}};

  var P = DATA.params;            // 72 fitted parameters
  var F = DATA.fixed;             // fixed structural constants
  var YEARS = DATA.years;         // 1998..2035
  var N = YEARS.length;           // 38
  var K_WEDGE = DATA.k_wedge;     // 5 — persistence-wedge trailing window
  var SPLIT_YEAR = DATA.split_year;       // 2007 — finance block split
  var EPH0 = DATA.eph_share_0;            // observed 2007/08 insurance share
  var RATE_REF = DATA.rate_ref;           // 3.0
  var MISC_JOBS = DATA.misc_jobs;         // 2000
  var LEVER_Y0 = DATA.meta.lever_start_year;   // 2025

  // cumulative UK price level, 1998 = 1.0 (sequential cumprod, as numpy)
  var P_UK = new Array(N);
  P_UK[0] = 1.0;
  for (var i = 1; i < N; i++) P_UK[i] = P_UK[i - 1] * (1 + DATA.infl[i] / 100);

  function clip(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }

  function meanTail(arr, k) {           // mean of the last k entries
    var n = arr.length, from = n - k; if (from < 0) from = 0;
    var s = 0;
    for (var j = from; j < n; j++) s += arr[j];
    return s / (n - from);
  }

  function meanSlice(arr, from, to) {   // mean of arr[from:to] (to exclusive)
    if (from < 0) from = 0;
    var s = 0;
    for (var j = from; j < to; j++) s += arr[j];
    return s / (to - from);
  }

  // weighted median wage across quantile blocks — mirrors
  // model_p6._median_from_blocks exactly (stable sort by wage)
  function medianFromBlocks(blocks) {
    var pts = [];
    for (var b = 0; b < blocks.length; b++) {
      var n = blocks[b][0], w = blocks[b][1], mlt = blocks[b][2];
      if (n <= 0) continue;
      for (var j = 0; j < mlt.length; j++)
        pts.push([w * mlt[j], n / mlt.length]);
    }
    pts.sort(function (a, b2) { return a[0] - b2[0]; });   // stable in ES2019+
    var tot = 0;
    for (var j2 = 0; j2 < pts.length; j2++) tot += pts[j2][1];
    var half = 0.5 * tot, c = 0;
    for (var j3 = 0; j3 < pts.length; j3++) {
      c += pts[j3][1];
      if (c >= half) return pts[j3][0];
    }
    return pts[pts.length - 1][0];
  }

  var SERIES_KEYS = [
    "gva_real", "gva_index", "customs", "population", "house_price",
    "public_emp", "F", "EG", "XN", "XS", "XEG", "fin_index",
    "F_lab", "F_eph", "eg_share", "W", "H", "employment", "reserves",
    "res_income", "revenue", "spending_nom", "gva_nominal",
    "jobs_F", "jobs_F_bi", "jobs_EG", "jobs_XN", "jobs_XS",
    "mig_in", "mig_out", "mig_net", "births", "deaths", "nat_change",
    "cohort_C", "cohort_A", "cohort_O", "dep_ratio",
    "earn_mean", "earn_median", "mm_ratio", "wage_bill",
    "income_tax", "ni_receipts", "pension_outgo", "public_wage_bill",
    "vacancy", "wdev"];

  function simP6(levers) {
    levers = levers || {};
    var hb = (levers.housebuild == null) ? 1.0 : +levers.housebuild;
    var sector = (levers.sector == null) ? "egaming" : String(levers.sector);
    var promoI = (levers.promo == null) ? 0.25 : clip(+levers.promo, 0, 1);
    var mig = (levers.migration == null) ? 1.0 : +levers.migration;
    var wPath = levers._wPath || null;   // testing hook (falling-W check)

    // lever paths — history (< 2025) is always the calibrated baseline
    var cm = new Array(N), pr = new Array(N), migMult = new Array(N);
    for (var i = 0; i < N; i++) {
      var lever = YEARS[i] >= LEVER_Y0;
      cm[i] = lever ? hb : 1.0;
      migMult[i] = lever ? mig : 1.0;
      pr[i] = DATA.promo[i];
      if (lever) pr[i] = (sector === "none") ? 0.0 : promoI;
    }

    // ---- states (identical initialisation to model_p6.sim)
    var C = F.C0, A = F.A0, O = F.O0;
    var H = F.H0, Lg = F.Lg0;
    var Ff = F.F_OUT0;
    var F_lab = Ff * (1 - EPH0), F_eph = Ff * EPH0;
    var W_hist = [];
    var EG = F.EG0;
    var XS = F.XS0;
    var XN = F.XEG0 - F.XS0 - F.EG0;
    var R = F.R0, W = 1.0;
    var HP = P.hp0;
    var RP = P.RP0;
    var ratio0 = (C + A + O) / F.H0;
    var promo_s = pr[0];
    var S = null, S_real0 = null;
    var hp_gr_real = [0.0, 0.0];
    var sigma = P.s1_0;
    var afford0 = null;
    var jobs_lo_prev = null;
    var nom_hist = [];
    var inc_real_prev = null;
    var g_inc = 0.0;
    var v_base = 0.0, mean_real0 = 0.0;

    var out = {};
    for (var k = 0; k < SERIES_KEYS.length; k++)
      out[SERIES_KEYS[k]] = new Array(N).fill(0);

    for (var i2 = 0; i2 < N; i2++) {
      var i3 = i2;                       // year index
      var y = YEARS[i3];
      var Pop = C + A + O;

      // ---- output
      var mf = 1.0 - P.mrg * Math.max(0.0, RATE_REF - DATA.rate[i3]);
      var F_out = Ff * mf * (1 - DATA.covid_out[i3]);
      var EG_out = EG * (1 - DATA.covid_out[i3]);
      var XN_out = XN * (1 - DATA.covid_out[i3]);
      var XS_out = XS * (1 - DATA.covid_out[i3]);
      var gov_gva = F.gov_prod * Lg * Math.pow(1 + F.gov_drift, y - 1998);
      var rental = F.rent_pd * H * Math.pow(1 + F.rent_drift, y - 1998);
      var gva = XN_out + XS_out + F_out + EG_out + gov_gva + rental;

      // ---- employment
      var jobs_XN = P.lxn * XN / Math.pow(1 + P.prod_xn, y - 1998);
      var jobs_XS = P.lxs * XS / Math.pow(1 + P.prod_xs, y - 1998);
      var jobs_F = P.lf * Ff;
      var jobs_F_bi = P.lf_bi * Ff / Math.pow(1 + P.prod_f, y - 1998);
      var jobs_EG = P.le_eg * EG;
      var n_lo = jobs_XN + jobs_XS;
      var n_md = Lg + MISC_JOBS;
      var n_hi = jobs_F + jobs_EG;
      var LD = n_lo + n_md + n_hi;
      var LS = P.a_wa * A;
      var v_raw = (LD - LS) / LS;
      if (i3 === 0) v_base = v_raw;
      var v_lvl = clip(v_raw - P.v_ref, -0.25, 0.25);
      var v = clip(v_raw - v_base, -0.25, 0.25);

      // ---- wages (weekly GBP, nominal)
      var wf = P_UK[i3] * Math.pow(W, 0.5);
      var w_lo = P.wlo0 * wf * Math.pow(1 + P.catch, Math.max(0, y - 2020));
      var w_md = P.wmd0 * P_UK[i3];
      var w_hi = P.whi0 * wf * (1 + P.prem * promo_s);
      var earn_mean = (n_lo * w_lo + n_md * w_md + n_hi * w_hi) / LD;
      var earn_med = medianFromBlocks(
        [[n_lo, w_lo, DATA.mlt_lo], [n_md, w_md, DATA.mlt_md],
         [n_hi, w_hi, DATA.mlt_hi]]);
      var WB = 52e-6 * (n_lo * w_lo + n_md * w_md + n_hi * w_hi);  // GBPm/yr

      // ---- nominal aggregates & customs — THREE REVENUE REGIMES
      var base_nom = gva * P_UK[i3] * W;
      var nom_eg = EG_out * P_UK[i3] * W * (1 + P.kappa * promo_s);
      var nom_gva = base_nom + (nom_eg - EG_out * P_UK[i3] * W);
      var eg_share = 100.0 * nom_eg / nom_gva;
      nom_hist.push(base_nom);
      var customs;
      if (y <= 2008) {
        // Common Purse: endogenous share-of-nominal-base feedback loop
        customs = sigma * base_nom * DATA.covid_customs[i3];
        if (y < F.vat_share_cap_year) sigma *= (1 + P.k_vat);
        else if (y >= 2007) sigma *= (1 - F.erosion_2007);
      } else if (y <= 2015) {
        // 2009-2015 rebasing window: OBSERVED receipts IMPOSED exactly.
        // Levers cannot move customs here — this is historical data.
        customs = DATA.customs_imposed[String(y)];
      } else {
        // FERSA: s3 x trailing 5-yr mean of the nominal base (no loop)
        var base = meanSlice(nom_hist, i3 - 5, i3);
        customs = P.s3 * base * DATA.covid_customs[i3];
      }

      // ---- fiscal block
      var mean_real = earn_mean / P_UK[i3];
      if (i3 === 0) mean_real0 = mean_real;
      var tau_eff = P.tau0 * (1 + P.prog * (mean_real / mean_real0 - 1.0));
      var inc_tax = tau_eff * WB + P.nr0 * Math.pow(0.87, y - 1998);
      var ni = P.ni_rate * WB;
      var pen = RP * P.pen0 * (w_md / P.wmd0) / 1000.0;   // GBPm
      var pwb = 52e-6 * Lg * w_md * P.oncost;
      var res_income = P.r_int * R;
      var rev = customs + inc_tax + res_income;
      if (S === null) { S = P.alpha * rev; S_real0 = S / P_UK[i3]; }
      var S_real = S / (P_UK[i3] * Math.pow(W, F.phi_w));
      var Lg_target = F.Lg0 * Math.pow(Math.max(S_real / S_real0, 0.05),
                                       P.beta_lg);
      var draw = (y >= F.draw_start)
        ? P.d_rate * Math.max(R - P.R_floor, 0.0) : 0.0;

      // ---- housing
      var ratio = Pop / H;
      var HP_star = P.hp0 * Math.pow(ratio / ratio0, P.eta_d) * W * P_UK[i3];
      var comp = cm[i3] * Math.max(0.0, P.c0 + P.c1 * Math.max(0.0, hp_gr_real[0]));

      // ---- demographic flows
      var fert = Math.pow(1 + P.br_tr, Math.max(0, y - F.fert_break));
      var births = P.br0 * A * fert;
      var deaths = P.dr0 * O * Math.pow(1 + P.dr_tr, y - 1998);
      var nat = births - deaths;

      // ---- gross migration
      var afford = HP / (w_lo * 52.0);
      if (afford0 === null) afford0 = afford;
      var displaced = 0.0;
      if (jobs_lo_prev !== null) displaced = Math.max(0.0, jobs_lo_prev - n_lo);
      var nlm = (P.nlm0 * Math.pow(F.nlm_decay, Math.max(0, y - F.nlm_break))
                 - ((y >= 2009 && y <= 2015) ? P.rev0 : 0.0))
                * DATA.covid_mig[i3];
      var work_in = (P.in0 + P.in1 * Math.max(v, -0.20))
                    * DATA.covid_mig[i3] * migMult[i3];
      work_in = clip(work_in, 0.0, 4000.0);
      var mig_in = work_in + Math.max(nlm, 0.0);
      var mig_out = (P.out0
                     + P.out1 * Math.max(0.0, afford / afford0 - 1.0)
                     + P.out2 * displaced
                     + P.out3 * Math.max(0.0, -v)) * DATA.covid_mig[i3];
      mig_out = clip(mig_out, 0.0, 4000.0) + Math.max(-nlm, 0.0);
      jobs_lo_prev = n_lo;

      // ---- record
      out.gva_real[i3] = gva;
      out.customs[i3] = customs;
      out.population[i3] = Pop;
      out.house_price[i3] = HP;
      out.public_emp[i3] = Lg;
      out.F[i3] = F_out; out.EG[i3] = EG_out;
      out.XN[i3] = XN_out; out.XS[i3] = XS_out;
      out.XEG[i3] = XN_out + XS_out + EG_out;
      out.fin_index[i3] = 100.0 * F_out / F.F_OUT0;
      out.F_lab[i3] = F_lab;
      out.F_eph[i3] = F_eph;
      out.eg_share[i3] = eg_share;
      out.W[i3] = W; out.H[i3] = H;
      out.employment[i3] = LD;
      out.jobs_F[i3] = jobs_F; out.jobs_F_bi[i3] = jobs_F_bi;
      out.jobs_EG[i3] = jobs_EG;
      out.jobs_XN[i3] = jobs_XN; out.jobs_XS[i3] = jobs_XS;
      out.mig_in[i3] = mig_in; out.mig_out[i3] = mig_out;
      out.mig_net[i3] = mig_in - mig_out;
      out.births[i3] = births; out.deaths[i3] = deaths;
      out.nat_change[i3] = nat;
      out.cohort_C[i3] = C; out.cohort_A[i3] = A; out.cohort_O[i3] = O;
      out.dep_ratio[i3] = (C + O) / A;
      out.earn_mean[i3] = earn_mean;
      out.earn_median[i3] = earn_med;
      out.mm_ratio[i3] = earn_mean / earn_med;
      out.wage_bill[i3] = WB;
      out.income_tax[i3] = inc_tax;
      out.ni_receipts[i3] = ni;
      out.pension_outgo[i3] = pen;
      out.public_wage_bill[i3] = pwb;
      out.reserves[i3] = R;
      out.res_income[i3] = res_income;
      out.revenue[i3] = rev;
      out.spending_nom[i3] = S;
      out.gva_nominal[i3] = nom_gva;
      out.vacancy[i3] = v;

      // ---- stock updates (order preserved from model_p6.sim)
      var inC = F.in_share[0], inA = F.in_share[1], inO = F.in_share[2];
      var nC = F.nlm_share[0], nA = F.nlm_share[1], nO = F.nlm_share[2];
      var oC = F.out_share[0], oA = F.out_share[1], oO = F.out_share[2];
      var age_CA = C / 16.0;
      var age_AO = P.r_AO * A;
      var dA_deaths = F.death_share_A * deaths;
      var dO_deaths = (1 - F.death_share_A) * deaths;
      var nlm_p = Math.max(nlm, 0.0), nlm_n = Math.max(-nlm, 0.0);
      var w_out = mig_out - nlm_n;
      C = Math.max(C + births - age_CA + inC * work_in + nC * nlm_p
                   - oC * w_out - nC * nlm_n, 1000.0);
      A = Math.max(A + age_CA - age_AO - dA_deaths
                   + inA * work_in + nA * nlm_p - oA * w_out - nA * nlm_n,
                   5000.0);
      O = Math.max(O + age_AO - dO_deaths + inO * work_in + nO * nlm_p
                   - oO * w_out - nO * nlm_n, 1000.0);

      H = H + comp - F.demolitions;
      var hp_new = HP + (HP_star - HP) / P.tau_hp;
      var gr_real = clip(hp_new / HP - 1 - DATA.infl[i3] / 100, -0.25, 0.30);
      hp_gr_real = [hp_gr_real[1], gr_real];
      HP = hp_new;

      W = W * (1 + P.w1 * v_lvl + P.w2 * Math.max(0.0, gr_real)
               - P.conv * (W - 1.0));
      W = clip(W, 0.6, 2.5);
      if (wPath !== null) W = wPath[i3];   // testing hook only
      W_hist.push(W);
      // PASS 6 persistence-form cost wedge:
      // wdev = W minus its trailing K_WEDGE-year mean (incl. current year)
      var wdev = W - meanTail(W_hist, K_WEDGE);
      out.wdev[i3] = wdev;

      if (y < SPLIT_YEAR) {
        Ff = Math.max(Ff * (1 + P.g_f0 + P.b_uk * DATA.g_ukf[i3]
                            - P.s_f * wdev), 1.0);
        F_lab = Ff * (1 - EPH0); F_eph = Ff * EPH0;
      } else {
        if (y === SPLIT_YEAR) { F_lab = Ff * (1 - EPH0); F_eph = Ff * EPH0; }
        F_lab = Math.max(F_lab * (1 + P.g_f0 + P.b_uk * DATA.g_ukf[i3]
                                  - P.s_f * wdev), 1.0);
        F_eph = Math.max(F_eph * (1 + P.g_f_eph - P.s_f_eph * wdev), 1.0);
        Ff = F_lab + F_eph;
      }
      var dEG = (pr[i3] * P.g_eg * EG * Math.max(0.0, 1 - EG / P.EG_max)
                 - P.decay_eg * EG - P.cpen_eg * wdev * EG);
      EG = Math.max(EG + dEG, 1.0);
      var pgrow = mig_in - mig_out + nat;
      // XN income-spillover channel (pass-6 fix 8)
      var inc_real = (WB + Math.max(S - pwb, 0.0)) / P_UK[i3];
      if (inc_real_prev !== null)
        g_inc = clip(inc_real / inc_real_prev - 1.0, -0.15, 0.15);
      inc_real_prev = inc_real;
      XN = Math.max(XN * (1 + P.g_xn + P.psi_sp * g_inc
                          + F.phi_pop * pgrow / Math.max(Pop, 1.0)
                          + P.phi_inc * DATA.g_uk[i3]
                          - P.sx_n * wdev), 1.0);
      XS = Math.max(XS * (1 + DATA.g_uk[i3] - P.sx_s * wdev
                          - P.sx_s_lvl * (W - 1.0)), 1.0);
      promo_s = promo_s + (pr[i3] - promo_s) / P.tau_pr;

      RP = RP + F.ret_rate * Lg - F.mort_rp * RP;

      var gap = P.alpha * rev + draw - S;
      var dS = gap > 0 ? gap / F.tau_S : Math.max(gap / 8.0, -P.r_down * S);
      S = S + dS;
      R = Math.max(R + rev - (S - dS), 0.0);
      var dLg = clip((Lg_target - Lg) / P.tau_lg,
                     -P.lg_down * Lg, F.hire_cap * Lg);
      Lg = Lg + dLg;
    }

    for (var i4 = 0; i4 < N; i4++)
      out.gva_index[i4] = out.gva_real[i4] / out.gva_real[0] * 100.0;

    out.years = YEARS.slice();
    return out;
  }

  simP6.YEARS = YEARS.slice();
  simP6.DATA = DATA;              // exposed for charts (obs series, meta)

  global.simP6 = simP6;
  if (typeof module !== "undefined" && module.exports)
    module.exports = { simP6: simP6, DATA: DATA };
})(typeof window !== "undefined" ? window
   : (typeof globalThis !== "undefined" ? globalThis : this));
