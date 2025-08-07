-- Remove duplicate utilities, keeping the ones with more specific names
DELETE FROM utilities WHERE name = 'Apă' AND EXISTS (
  SELECT 1 FROM utilities u2 WHERE u2.name = 'Apă' AND u2.id != utilities.id
);

DELETE FROM utilities WHERE name = 'Asigurare CASCO' AND EXISTS (
  SELECT 1 FROM utilities u2 WHERE u2.name = 'Asigurare CASCO' AND u2.id != utilities.id
);

DELETE FROM utilities WHERE name = 'Taxă Concesiune Cimitir' AND EXISTS (
  SELECT 1 FROM utilities u2 WHERE u2.name = 'Taxă Concesiune Cimitir' AND u2.id != utilities.id
);

DELETE FROM utilities WHERE name = 'Curent' AND EXISTS (
  SELECT 1 FROM utilities u2 WHERE u2.name = 'Curent Electric' AND u2.category_id = utilities.category_id
);

DELETE FROM utilities WHERE name = 'Gaze' AND EXISTS (
  SELECT 1 FROM utilities u2 WHERE u2.name = 'Gaze Naturale' AND u2.category_id = utilities.category_id
);
