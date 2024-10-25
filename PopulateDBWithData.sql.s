-- Create temporary tables to store generated IDs of the AUTO INCREMENT PK fields
DECLARE @JobPositionIds TABLE (Id INT, JobTitle NVARCHAR(255));
DECLARE @QuestionIds TABLE (Id INT, Text NVARCHAR(255));
DECLARE @ResumeIds TABLE (Id INT, Email NVARCHAR(255));

----------------------------------------------------------------

-- Insert Job Positions
INSERT INTO JobPosition (JobTitle, Location, Department, EmploymentType, Status)
OUTPUT INSERTED.Id, INSERTED.JobTitle INTO @JobPositionIds
VALUES 
    ('Full-stack Engineer', 'Helsinki, Finland', 0, 0, 0), -- Engineering department, Permanent - Full Time Employment type, and Closed Status
    ('Enterprise Sales Development Representative', 'London, UK', 1, 0, 1), -- Sales Development department, Permanent - Full Time Employment type, and Open Status
    ('Enterprise Customer Success Manager', 'Helsinki, Finland', 2, 0, 1); -- Customer Success department, Permanent - Full Time Employment type, and Open Status

----------------------------------------------------------------

-- Insert Questions
INSERT INTO Question (Text)
OUTPUT INSERTED.Id, INSERTED.Text INTO @QuestionIds
VALUES 
    ('Have you worked extensively with .NET?'), -- Question 1
    ('Have you worked extensively with Javascript and Typescipt?'), -- Question 2
    ('Have you worked extensively with SQL Server or Postgre SQL?'), -- Question 3
    ('Do you have the right to work in Finland?'), -- Question 4
    ('Have you worked as a CSM at an enterprise level i.e. specifically with large multinational enterprises?'), -- Question 5
    ('Do you have the right to work in the United Kingdom?'), -- Question 6
    ('Do you have a degree in STEM, Law, Economics, Business or a related subject?'), -- Question 7
    ('Do you have at least six months of prior SDR experience in an international-facing role?'); -- Question 8

----------------------------------------------------------------

-- Insert specific links into the JobPositionQuestion junction table
-- Link 'Full-stack Engineer' to questions 1, 2, 3 and 4
INSERT INTO JobPositionQuestions (JobPositionId, QuestionsId)
SELECT jp.Id, q.Id
FROM @JobPositionIds jp
JOIN @QuestionIds q ON (jp.JobTitle = 'Full-stack Engineer' AND q.Text IN 
    ('Have you worked extensively with .NET?',
    'Have you worked extensively with Javascript and Typescipt?',
    'Have you worked extensively with SQL Server or Postgre SQL?',
    'Do you have the right to work in Finland?'))
UNION ALL
-- Link 'Enterprise Sales Development Representative' to questions 6, 7 and 8
SELECT jp.Id, q.Id
FROM @JobPositionIds jp
JOIN @QuestionIds q ON (jp.JobTitle = 'Enterprise Sales Development Representative' AND q.Text IN 
    ('Do you have the right to work in the United Kingdom?',
    'Do you have a degree in STEM, Law, Economics, Business or a related subject?',
    'Do you have at least six months of prior SDR experience in an international-facing role?'))
UNION ALL
-- Link 'Enterprise Customer Success Manager' to questions 4 and 5
SELECT jp.Id, q.Id
FROM @JobPositionIds jp
JOIN @QuestionIds q ON (jp.JobTitle = 'Enterprise Customer Success Manager' AND q.Text IN 
    ('Do you have the right to work in Finland?',
    'Have you worked as a CSM at an enterprise level i.e. specifically with large multinational enterprises?'));

----------------------------------------------------------------

-- Insert Resumes using the generate JobPositionId
INSERT INTO Resume (FirstName, LastName, Email, Phone, LinkedInUrl, ResumeFilePath, AllowDataProcessing, Description, IsActive, JobPositionId)
OUTPUT INSERTED.Id, INSERTED.Email INTO @ResumeIds
SELECT 
    'John', 
    'Doe', 
    'johndoe@mail.com', 
    '+358412345678', 
    'https://linkedin.com/in/johndoe', 
    'resumes/johndoe.pdf', 
    1, 
    'Experienced software engineer with 5+ years in full-stack development.', 
    0,
    jp.Id -- Use JobPositionId from @JobPositionIds table
FROM @JobPositionIds jp
WHERE jp.JobTitle = 'Full-stack Engineer'
UNION ALL
SELECT 
    'Jane', 
    'Smith', 
    'janesmith@mail.com', 
    '+358487654321', 
    'https://linkedin.com/in/janesmith', 
    'resumes/janesmith.pdf', 
    1, 
    'Project manager with expertise in agile methodologies and team leadership.', 
    1,
    jp.Id
FROM @JobPositionIds jp
WHERE jp.JobTitle = 'Enterprise Customer Success Manager'
UNION ALL
SELECT 
    'Bob', 
    'Brown', 
    'bobbrown@mail.com', 
    '+440123456789', 
    'https://linkedin.com/in/bobbrown', 
    'resumes/bobbrown.pdf', 
    1, 
    'Data scientist with a focus on machine learning and data visualization.', 
    1,
    jp.Id
FROM @JobPositionIds jp
WHERE jp.JobTitle = 'Enterprise Sales Development Representative';

----------------------------------------------------------------

-- Insert Question Answers using the generated ResumeIds and QuestionIds
INSERT INTO QuestionAnswer (ResumeId, QuestionId, Answer)
-- John Doe answered "Yes" to experience with .NET
SELECT r.Id, q.Id, 1 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'johndoe@mail.com' AND q.Text = 'Have you worked extensively with .NET?') 
UNION ALL
-- John Doe answered "No" to experience with Javascript and Typescript
SELECT r.Id, q.Id, 0 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'johndoe@mail.com' AND q.Text = 'Have you worked extensively with Javascript and Typescipt?') 
UNION ALL
-- John Doe answered "Yes" to experience with SQL Server and Postgre SQL
SELECT r.Id, q.Id, 1 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'johndoe@mail.com' AND q.Text = 'Have you worked extensively with SQL Server or Postgre SQL?') 
UNION ALL
-- John Doe answered "Yes" to right to work in Finland
SELECT r.Id, q.Id, 1 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'johndoe@mail.com' AND q.Text = 'Do you have the right to work in Finland?') 
UNION ALL
-- Jane Smith answered "No" to CSM experience at Entreprise level
SELECT r.Id, q.Id, 0 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'janesmith@mail.com' AND q.Text = 'Have you worked as a CSM at an enterprise level i.e. specifically with large multinational enterprises?') 
UNION ALL
-- Jane Smith answered "Yes" to right to work in Finland
SELECT r.Id, q.Id, 1 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'janesmith@mail.com' AND q.Text = 'Do you have the right to work in Finland?') 
UNION ALL
-- Bob Brown answered "Yes" to right to work in UK
SELECT r.Id, q.Id, 1 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'bobbrown@mail.com' AND q.Text = 'Do you have the right to work in the United Kingdom?') 
UNION ALL
-- Bob Brown answered "Yes" to STEM/Law/Economics/Business degree
SELECT r.Id, q.Id, 1 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'bobbrown@mail.com' AND q.Text = 'Do you have a degree in STEM, Law, Economics, Business or a related subject?') 
UNION ALL
-- Bob Brown answered "No" to SDR experience
SELECT r.Id, q.Id, 0 FROM @ResumeIds r JOIN @QuestionIds q 
ON (r.Email = 'bobbrown@mail.com' AND q.Text = 'Do you have at least six months of prior SDR experience in an international-facing role?') 