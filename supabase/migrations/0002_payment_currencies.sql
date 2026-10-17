-- Widen payments.currency past NGN and USD.
-- NOT APPLIED. Victor reviews this SQL before anyone runs it.
-- RLS is unchanged: select-own policies stay, and browsers still cannot write.
-- The inline check from 0001_premium.sql is named payments_currency_check by PostgreSQL.

alter table public.payments drop constraint payments_currency_check;

alter table public.payments add constraint payments_currency_check
  check (currency in (
    'USD', 'NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'RWF', 'ZMW',
    'EGP', 'MAD', 'XOF', 'XAF', 'GBP', 'EUR'
  ));
