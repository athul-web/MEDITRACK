import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchHospitalsByName } from './hospitalService';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb) => Promise.resolve({ data: [], error: null }).then(cb)),
  },
  mapDbToFrontend: (data: any) => data,
}));

describe('searchHospitalsByName safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty result without querying for empty input', async () => {
    const result = await searchHospitalsByName('   ');
    expect(result).toEqual([]);
  });
});
