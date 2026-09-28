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

  it('should fetch hospitals from the correct table', async () => {
    await repo.getHospitals();
    expect(supabase.from).toHaveBeenCalledWith('kerala_hospitals');
  });

  it('should apply district filter using city and address columns', async () => {
    const mockFilters: HospitalSearchFilters = {
      requiredResources: [],
      district: 'Ernakulam',
    };

    await repo.searchHospitals(mockFilters);
    expect(mockClient.or).toHaveBeenCalledWith('city.ilike.%Ernakulam%,address.ilike.%Ernakulam%');
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
    expect(mockClient.or).toHaveBeenCalledWith('city.ilike.%Trivandrum%,address.ilike.%Trivandrum%');
    expect(mockClient.eq).toHaveBeenCalledWith('category', 'single_specialty');
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
