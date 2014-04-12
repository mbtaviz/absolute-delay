window.LINES = {
  blue: [
    {id:"place-wondl", name: "Wonderland Station", prev:[], next:["place-rbmnl"]},
    {id:"place-rbmnl", name: "Revere Beach Station", prev:["place-wondl"], next:["place-bmmnl"]},
    {id:"place-bmmnl", name: "Beachmont Station", prev:["place-rbmnl"], next:["place-sdmnl"]},
    {id:"place-sdmnl", name: "Suffolk Downs Station", prev:["place-bmmnl"], next:["place-orhte"]},
    {id:"place-orhte", name: "Orient Heights Station", prev:["place-sdmnl"], next:["place-wimnl"]},
    {id:"place-wimnl", name: "Wood Island Station", prev:["place-orhte"], next:["place-aport"]},
    {id:"place-aport", name: "Airport Station", prev:["place-wimnl"], next:["place-mvbcl"]},
    {id:"place-mvbcl", name: "Maverick Station", prev:["place-aport"], next:["place-aqucl"]},
    {id:"place-aqucl", name: "Aquarium Station", prev:["place-mvbcl"], next:["place-state"]},
    {id:"place-state", name: "State St. Station", prev:["place-aqucl"], next:["place-gover"]},
    {id:"place-gover", name: "Government Center Station", prev:["place-state"], next:["place-bomnl"]},
    {id:"place-bomnl", name: "Bowdoin Station", prev:["place-gover"], next:[]}
  ],
  orange: [
    {id:"place-ogmnl", name: "Oak Grove Station", prev:[], next:["place-mlmnl"]},
    {id:"place-mlmnl", name: "Malden Center Station", prev:["place-ogmnl"], next:["place-welln"]},
    {id:"place-welln", name: "Wellington Station", prev:["place-mlmnl"], next:["place-sull"]},
    {id:"place-sull", name: "Sullivan Station", prev:["place-welln"], next:["place-ccmnl"]},
    {id:"place-ccmnl", name: "Community College Station", prev:["place-sull"], next:["place-north"]},
    {id:"place-north", name: "North Station", prev:["place-ccmnl"], next:["place-haecl"]},
    {id:"place-haecl", name: "Haymarket Station", prev:["place-north"], next:["place-state"]},
    {id:"place-state", name: "State St. Station", prev:["place-haecl"], next:["place-dwnxg"]},
    {id:"place-dwnxg", name: "Downtown Crossing Station", prev:["place-state"], next:["place-chncl"]},
    {id:"place-chncl", name: "Chinatown Station", prev:["place-dwnxg"], next:["place-tumnl"]},
    {id:"place-tumnl", name: "Tufts Medical Center Station", prev:["place-chncl"], next:["place-bbsta"]},
    {id:"place-bbsta", name: "Back Bay Station", prev:["place-tumnl"], next:["place-masta"]},
    {id:"place-masta", name: "Massachusetts Ave. Station", prev:["place-bbsta"], next:["place-rugg"]},
    {id:"place-rugg", name: "Ruggles Station", prev:["place-masta"], next:["place-rcmnl"]},
    {id:"place-rcmnl", name: "Roxbury Crossing Station", prev:["place-rugg"], next:["place-jaksn"]},
    {id:"place-jaksn", name: "Jackson Square Station", prev:["place-rcmnl"], next:["place-sbmnl"]},
    {id:"place-sbmnl", name: "Stony Brook Station", prev:["place-jaksn"], next:["place-grnst"]},
    {id:"place-grnst", name: "Green St. Station", prev:["place-sbmnl"], next:["place-forhl"]},
    {id:"place-forhl", name: "Forest Hills Station", prev:["place-grnst"], next:[]}
  ],
  red: [
    {id:"place-alfcl", name: "Alewife Station", prev:[], next:["place-davis"]},
    {id:"place-davis", name: "Davis Station", prev:["place-alfcl"], next:["place-portr"]},
    {id:"place-portr", name: "Porter Square Station", prev:["place-davis"], next:["place-harsq"]},
    {id:"place-harsq", name: "Harvard Square Station", prev:["place-portr"], next:["place-cntsq"]},
    {id:"place-cntsq", name: "Central Square Station", prev:["place-harsq"], next:["place-knncl"]},
    {id:"place-knncl", name: "Kendall/MIT Station", prev:["place-cntsq"], next:["place-chmnl"]},
    {id:"place-chmnl", name: "Charles/MGH Station", prev:["place-knncl"], next:["place-pktrm"]},
    {id:"place-pktrm", name: "Park St. Station", prev:["place-chmnl"], next:["place-dwnxg"]},
    {id:"place-dwnxg", name: "Downtown Crossing Station", prev:["place-pktrm"], next:["place-sstat"]},
    {id:"place-sstat", name: "South Station", prev:["place-dwnxg"], next:["place-brdwy"]},
    {id:"place-brdwy", name: "Broadway Station", prev:["place-sstat"], next:["place-andrw"]},
    {id:"place-andrw", name: "Andrew Station", prev:["place-brdwy"], next:["place-jfk"]},
    {id:"place-jfk", name: "JFK/UMass Station", prev:["place-andrw"], next:["place-shmnl", "place-nqncy"]},
    {id:"place-shmnl", name: "Savin Hill Station", prev:["place-jfk"], next:["place-fldcr"]},
    {id:"place-fldcr", name: "Fields Corner Station", prev:["place-shmnl"], next:["place-smmnl"]},
    {id:"place-smmnl", name: "Shawmut Station", prev:["place-fldcr"], next:["place-asmnl"]},
    {id:"place-asmnl", name: "Ashmont Station", prev:["place-smmnl"], next:[]},
    {id:"place-nqncy", name: "North Quincy Station", prev:["place-jfk"], next:["place-wlsta"]},
    {id:"place-wlsta", name: "Wollaston Station", prev:["place-nqncy"], next:["place-qnctr"]},
    {id:"place-qnctr", name: "Quincy Center Station", prev:["place-wlsta"], next:["place-qamnl"]},
    {id:"place-qamnl", name: "Quincy Adams Station", prev:["place-qnctr"], next:["place-brntn"]},
    {id:"place-brntn", name: "Braintree Station", prev:["place-qamnl"], next:[]}
  ]
};
_.keys(LINES).forEach(function (line) {
  LINES[line] = _.indexBy(LINES[line], 'id');
  _.values(LINES[line]).forEach(function (stop) {
    stop.prev = stop.prev.map(function (id) { return LINES[line][id]; });
    stop.next = stop.next.map(function (id) { return LINES[line][id]; });
  });
});