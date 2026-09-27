import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseHospitalRepository } from './supabaseHospitalRepository';
import { supabase } from '../../lib/supabase';
import { HospitalSearchFilters } from '../../types/public';

// Create a robust mock for the Supabase chain
const createSupabaseMock = () => {
  const mock = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    // Make the final call resolve to data/error
    then: vi.fn().mockImplementation(function(onfulfilled) {
      return Promise.resolve({ data: [], error: null }).then(onfulfilled);
    }),
  };
  // To allow `await query` to work, the mock needs to be a Thenable
  return mock;
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    filter: vi.fn(),
    order: vi.fn(),
  },
  mapDbToFrontend: (data: any) => data,
}));

describe('SupabaseHospitalRepository', () => {
  let repo: SupabaseHospitalRepository;
  let mockClient: any;

  beforeEach(() => {
    repo = new SupabaseHospitalRepository();
    vi.clearAllMocks();

    mockClient = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      // This allows the query to be awaited
      then: vi.fn().mockImplementation(function(callback) {
        return Promise.resolve({ data: [], error: null }).then(callback);
      }),
    };

    (supabase.from as any).mockImplementation(() => mockClient);
  });

  it('should fetch hospitals from the correct table', async () => {
    await repo.getHospitals();
    expect(supabase.from).toHaveBeenCalledWith('kerala_hospitals');
  });

  it('should apply district filter when provided', async () => {
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      district: 'Ernakulam',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.eq).toHaveBeenCalledWith('district', 'Ernakulam');
  });

  it('should apply category filter when provided', async () => {
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      category: 'multi_specialty',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.eq).toHaveBeenCalledWith('category', 'multi_specialty');
  });

  it('should apply both district and category filters', async () => {
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      district: 'Trivandrum',
      category: 'single_specialty',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.eq).toHaveBeenCalledWith('district', 'Trivandrum');
    expect(mockClient.eq).toHaveBeenCalledWith('category', 'single_specialty');
  });
});
