<?php

namespace App\Support;

use App\Models\AttendanceModel;
use DateTimeImmutable;

/**
 * Filtres de période pour les listes de présences (jour, semaine ISO, mois, intervalle).
 */
final class AttendanceListFilters
{
    /**
     * @param array<string, mixed> $query
     *
     * @return array{from: ?string, to: ?string}|array{error: string}
     */
    public static function resolve(array $query): array
    {
        $from  = trim((string) ($query['from'] ?? ''));
        $to    = trim((string) ($query['to'] ?? ''));
        $month = trim((string) ($query['month'] ?? ''));
        $week  = trim((string) ($query['week'] ?? ''));
        $date  = trim((string) ($query['date'] ?? ''));

        if ($from !== '' || $to !== '') {
            if ($from !== '' && preg_match('/\A\d{4}-\d{2}-\d{2}\z/', $from) !== 1) {
                return ['error' => 'Le paramètre from doit être au format AAAA-MM-JJ.'];
            }
            if ($to !== '' && preg_match('/\A\d{4}-\d{2}-\d{2}\z/', $to) !== 1) {
                return ['error' => 'Le paramètre to doit être au format AAAA-MM-JJ.'];
            }

            return ['from' => $from !== '' ? $from : null, 'to' => $to !== '' ? $to : null];
        }

        if ($month !== '') {
            $range = self::rangeForMonth($month);

            return $range ?? ['error' => 'Le paramètre month doit être au format AAAA-MM.'];
        }

        if ($week !== '') {
            $range = self::rangeForWeek($week);

            return $range ?? ['error' => 'Le paramètre week doit être au format AAAA-Www (semaine ISO, ex. 2026-W46).'];
        }

        if ($date !== '' && preg_match('/\A\d{4}-\d{2}-\d{2}\z/', $date) === 1) {
            return ['from' => $date, 'to' => $date];
        }

        if ($date !== '') {
            return ['error' => 'Le paramètre date doit être au format AAAA-MM-JJ.'];
        }

        return ['from' => null, 'to' => null];
    }

    /**
     * @param array{from: ?string, to: ?string} $range
     */
    public static function applyToModel(AttendanceModel $model, array $range): void
    {
        if (($range['from'] ?? null) !== null) {
            $model->where('attendance_date >=', $range['from']);
        }
        if (($range['to'] ?? null) !== null) {
            $model->where('attendance_date <=', $range['to']);
        }
    }

    /**
     * @return array{from: string, to: string}|null
     */
    private static function rangeForMonth(string $month): ?array
    {
        if (preg_match('/\A(\d{4})-(\d{2})\z/', $month, $matches) !== 1) {
            return null;
        }

        $year  = (int) $matches[1];
        $monthNum = (int) $matches[2];
        if ($monthNum < 1 || $monthNum > 12) {
            return null;
        }

        $from = sprintf('%04d-%02d-01', $year, $monthNum);
        $to   = (new DateTimeImmutable($from))->modify('last day of this month')->format('Y-m-d');

        return ['from' => $from, 'to' => $to];
    }

    /**
     * @return array{from: string, to: string}|null
     */
    private static function rangeForWeek(string $week): ?array
    {
        if (preg_match('/\A(\d{4})-W(\d{1,2})\z/i', $week, $matches) !== 1) {
            return null;
        }

        $year    = (int) $matches[1];
        $weekNum = (int) $matches[2];
        if ($weekNum < 1 || $weekNum > 53) {
            return null;
        }

        try {
            $start = new DateTimeImmutable('now', new \DateTimeZone('UTC'));
            $start = $start->setISODate($year, $weekNum);
        } catch (\Exception) {
            return null;
        }

        $end = $start->modify('+6 days');

        return [
            'from' => $start->format('Y-m-d'),
            'to'   => $end->format('Y-m-d'),
        ];
    }
}
