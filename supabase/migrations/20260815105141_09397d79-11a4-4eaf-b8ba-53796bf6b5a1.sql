UPDATE public.site_content SET value = replace(replace(value, '2,99', '1,99'), '2.99', '1.99') WHERE value LIKE '%2,99%' OR value LIKE '%2.99%';
DELETE FROM public.comments WHERE dog_id = 'c9692e1d-6549-478c-ba9a-6fde8e4b9997';
DELETE FROM public.votes WHERE dog_id = 'c9692e1d-6549-478c-ba9a-6fde8e4b9997';
DELETE FROM public.payments WHERE dog_id = 'c9692e1d-6549-478c-ba9a-6fde8e4b9997';
DELETE FROM public.dogs WHERE id = 'c9692e1d-6549-478c-ba9a-6fde8e4b9997';