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
    or: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    // Make the final call resolve to data/error
    then: vi.fn().mockImplementation(function(onfulfilled) {
      return Promise.resolve({ data: [], error: null }).then(onfulfilled);
    }),
  };
  return mock;
};

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    or: vi.fn(),
    ilike: vi.fn(),
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
      or: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation(function(callback) {
        return Promise.resolve({ data: [], error: null }).then(callback);
      }),
    };

    (supabase.from as any).mockImplementation(() => mockClient);
  });

  it('should fetch hospitals from the correct table (public_hospitals)', async () => {
    await repo.getHospitals();
    // The repository targets `public_hospitals`, the actual directory dataset.
    // `kerala_hospitals` does not exist in the database; `hospitals` is the
    // tenant-registry table, also unrelated to public directory queries.
    expect(supabase.from).toHaveBeenCalledWith('public_hospitals');
  });

  it('should apply district filter using city and address columns', async () => {
    // `public_hospitals` does not have a dedicated `district` column.
    // The filter uses `city` and `address` which are the available text fields.
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      district: 'Ernakulam',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.or).toHaveBeenCalledWith('city.ilike.%Ernakulam%,address.ilike.%Ernakulam%');
  });

  it('should NOT apply category filter (public_hospitals has no category column)', async () => {
    // `public_hospitals` does not have a `category` column. The repository
    // skips that filter to avoid a PostgREST error on a non-existent column.
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      category: 'multi_specialty',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.eq).not.toHaveBeenCalledWith('category', 'multi_specialty');
  });

  it('should apply district filter only (no category column in public_hospitals)', async () => {
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      district: 'Trivandrum',
      category: 'single_specialty',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.or).toHaveBeenCalledWith('city.ilike.%Trivandrum%,address.ilike.%Trivandrum%');
    // Category filter is intentionally not applied
    expect(mockClient.eq).not.toHaveBeenCalledWith('category', 'single_specialty');
  });

  it('should not perform string query matching for GPS "Current Location"', async () => {
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      location: {
        latitude: 9.9816,
        longitude: 76.2999,
        label: 'Current Location',
      },
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.or).not.toHaveBeenCalled();
  });
});
