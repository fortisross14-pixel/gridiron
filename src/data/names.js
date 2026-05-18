// Name pools for procedural player generation.
//
// FIRST: 100 names — mix of common, NFL-flavored, and varied origin.
// LAST:  200 names — mix of three buckets:
//   - NFL legends & current stars (Brady, Manning, Montana, Mahomes, etc.)
//   - Common generic surnames (Smith, Johnson, Williams)
//   - Less common / unusual surnames for flavor
// COACH_LAST: 60 names — real & generic coaching surnames.

export const FIRST = [
  // Common American
  'Michael', 'James', 'David', 'John', 'Robert', 'William', 'Thomas', 'Christopher',
  'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Paul', 'Andrew', 'Kenneth',
  'Joshua', 'Kevin', 'Brian', 'Jason', 'Ryan', 'Justin', 'Jonathan', 'Tyler',
  // NFL-flavored & modern
  'Jalen', 'Marcus', 'Kyle', 'DeShawn', 'Trevor', 'Antonio', 'Maurice', 'Khalil',
  'Tyree', 'Damon', 'Cooper', 'Jaxon', 'Brock', 'Travis', 'Aaron', 'Patrick',
  'Lamar', 'Joe', 'Caleb', 'Bryce', 'Drake', 'Jordan', 'Christian',
  'Saquon', 'Bijan', 'Derrick', 'Ezekiel', 'Stefon', 'CeeDee', 'Davante',
  'Garrett', 'Maxx', 'Nick', 'T.J.', 'Micah', 'Roquan', 'Fred', 'Sauce',
  'Tre', 'Harrison', 'Jaylen', 'Marvin', 'Calvin', 'Deebo', 'Amon-Ra', 'Puka',
  'DK', 'George', 'Quinnen', 'Aidan', 'Will', 'Joey', 'Jaire', 'Pat',
  // Less common
  'Xavier', 'Quincy', 'Malik', 'Tariq', 'Rashawn', 'Demetrius', 'Cornelius',
  'Donovan', 'Terrell', 'Tristan', 'Jermaine', 'Darius', 'Sterling', 'Devontae',
  'Isaiah', 'Elijah', 'Ezra', 'Cedric', 'Reggie', 'Bryson', 'Bo', 'Tank',
  'Hollywood', 'Roman', 'Zaire', 'Kayvon', 'Trent', 'Najee', 'Breece',
];

export const LAST = [
  // NFL legends — QB/skill position royalty
  'Brady', 'Manning', 'Montana', 'Marino', 'Elway', 'Favre', 'Rodgers', 'Mahomes',
  'Brees', 'Roethlisberger', 'Aikman', 'Young', 'Staubach', 'Bradshaw', 'Tarkenton',
  'Unitas', 'Namath', 'Starr', 'Rivers', 'Romo', 'Cousins', 'Wilson', 'Watson',
  'Burrow', 'Herbert', 'Allen', 'Jackson', 'Hurts', 'Lawrence', 'Stroud', 'Maye',
  // NFL skill position legends
  'Rice', 'Owens', 'Moss', 'Harrison', 'Megatron', 'Johnson', 'Sanders', 'Smith',
  'Bettis', 'Faulk', 'Tomlinson', 'Peterson', 'Henry', 'Barkley', 'McCaffrey',
  'Gronkowski', 'Gates', 'Kelce', 'Sharpe', 'Gonzalez', 'Witten', 'Andrews',
  'Diggs', 'Lamb', 'Adams', 'Jefferson', 'Chase', 'Hill', 'Nacua', 'Olave',
  // NFL defenders
  'Watt', 'Garrett', 'Bosa', 'Donald', 'Mack', 'Miller', 'Strahan', 'Taylor',
  'Lewis', 'Urlacher', 'Singletary', 'Butkus', 'Nitschke', 'Lambert', 'Greene',
  'Parsons', 'Crosby', 'Hendrickson', 'Sweat', 'Anderson', 'Reddick', 'Hutchinson',
  'Sherman', 'Revis', 'Bailey', 'Woodson', 'Atwater', 'Gardner', 'Surtain', 'Slay',
  // Common American surnames
  'Williams', 'Brown', 'Jones', 'Garcia', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Thomas', 'Moore',
  'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Clark',
  'Walker', 'King', 'Wright', 'Scott', 'Green',
  'Baker', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Phillips', 'Evans',
  'Turner', 'Parker', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy', 'Cook',
  'Rogers', 'Cooper', 'Bell', 'Howard', 'Ward', 'Cox', 'Reilly',
  'Bennett', 'Foster', 'Russell', 'Griffin', 'Hayes', 'Long', 'Patterson', 'Hughes',
  // Less common / international flavor
  'Paulson', 'Okonkwo', 'Vasquez', 'Castellanos', 'Petrov', 'Achebe', 'Kowalski',
  'Sundberg', 'Hadid', 'Onuoha', 'Goldberg', 'Quigley', 'Beauchamp', 'Devereaux',
  'Romanowski', 'Sanchez-Vega', 'Beauford', 'Kingsley', 'Ravensdale', 'Asante',
  'Mbeki', 'Yamamoto', 'Tanaka', 'Cho', 'Ng', 'Patel', 'Singh', 'Khoury',
  'Saint-Hubert', 'Calloway', 'Heisman', 'Westbrook', 'Whitfield', 'Atherton',
  'Banks', 'Carmichael', 'Pendleton', 'Holloway', 'Kane', 'Spence', 'Bouchard',
  'Rourke', 'Lindquist', 'Garibaldi', 'Czerwinski', 'Konstantinov', 'Albright',
  'Beaumont', 'Faulkner', 'Hollister', 'Wexford',
  // Modern stars and current era
  'Lockett', 'Metcalf', 'Pickens', 'Higgins', 'Waddle', 'Aiyuk', 'Flowers',
  'Kincaid', 'LaPorta', 'Achane', 'Etienne', 'Pollard', 'Pacheco', 'Mostert',
  'Conner', 'Robinson', 'Pitts', 'Kittle', 'Stingley', 'Ramsey', 'Reed',
  'Macdonald', 'Stenavich', 'Pierce', 'Canales',
];

export const COACH_LAST = [
  // Legendary coaches
  'Lombardi', 'Shula', 'Walsh', 'Noll', 'Halas', 'Madden', 'Landry', 'Parcells',
  'Belichick', 'Reid', 'Cowher', 'Holmgren', 'Gibbs', 'Knoll', 'Levy',
  // Modern era
  'McVay', 'Shanahan', 'Tomlin', 'LaFleur', 'Harbaugh', 'Sirianni', 'McDermott',
  'Carroll', 'Payton', 'Stefanski', 'Campbell', "O'Connell", 'Vrabel', 'Pederson',
  'Staley', 'Saleh', 'Rivera', 'Daboll', 'Quinn', 'McDaniel', 'Bowles',
  'Macdonald', 'Glenn', 'Moore', 'Johnson', 'Pierce', 'Canales', 'Ryans', 'Mayo',
  // Generic
  'Smith', 'Wallace', 'Tanner', 'Whitt', 'Allen', 'Morris', 'Stenavich', 'Monken',
  'Roman', 'Thornton', 'Beck', 'Calloway', 'Ashford', 'Brooks', 'Doyle',
  'Henderson', 'Mason', 'Caldwell', 'Hawthorne',
];
