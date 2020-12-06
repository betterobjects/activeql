import gql from 'graphql-tag';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};



export type AvailabilityMeasure = DataSecurityMeasure & {
  __typename?: 'AvailabilityMeasure';
  id: Scalars['ID'];
  category: AvailabilityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategories?: Maybe<Array<Maybe<DataSecurityMeasureCategory>>>;
  measureApplications?: Maybe<Array<Maybe<MeasureApplication>>>;
};

export enum AvailabilityMeasureCategory {
  Availability = 'AVAILABILITY',
  Recovery = 'RECOVERY'
}

export type AvailabilityMeasureCategoryFilter = {
  ne?: Maybe<AvailabilityMeasureCategory>;
  eq?: Maybe<AvailabilityMeasureCategory>;
  in?: Maybe<Array<Maybe<AvailabilityMeasureCategory>>>;
  notIn?: Maybe<Array<Maybe<AvailabilityMeasureCategory>>>;
};

export type AvailabilityMeasureCreateInput = {
  category: AvailabilityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type AvailabilityMeasureFilter = {
  id?: Maybe<Scalars['ID']>;
  category?: Maybe<AvailabilityMeasureCategoryFilter>;
  name?: Maybe<Scalars['String']>;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
};

export type AvailabilityMeasureUpdateInput = {
  id: Scalars['ID'];
  category: AvailabilityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type Client = {
  __typename?: 'Client';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  dsb?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  zip: Scalars['String'];
  address1: Scalars['String'];
  address2?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  organisations?: Maybe<Array<Maybe<Organisation>>>;
};

export type ClientCreateInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  dsb?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  zip: Scalars['String'];
  address1: Scalars['String'];
  address2?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
};

export type ClientFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
  description?: Maybe<StringFilter>;
  dsb?: Maybe<StringFilter>;
  city?: Maybe<StringFilter>;
  zip?: Maybe<StringFilter>;
  address1?: Maybe<StringFilter>;
  address2?: Maybe<StringFilter>;
  country?: Maybe<StringFilter>;
};

export type ClientUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  dsb?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  zip: Scalars['String'];
  address1: Scalars['String'];
  address2?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
};

export type ConfidentialityMeasure = DataSecurityMeasure & {
  __typename?: 'ConfidentialityMeasure';
  id: Scalars['ID'];
  category: ConfidentialityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategories?: Maybe<Array<Maybe<DataSecurityMeasureCategory>>>;
  measureApplications?: Maybe<Array<Maybe<MeasureApplication>>>;
};

export enum ConfidentialityMeasureCategory {
  AccessControl = 'ACCESS_CONTROL',
  TransportControl = 'TRANSPORT_CONTROL',
  Pseudonymization = 'PSEUDONYMIZATION',
  Encryption = 'ENCRYPTION'
}

export type ConfidentialityMeasureCategoryFilter = {
  ne?: Maybe<ConfidentialityMeasureCategory>;
  eq?: Maybe<ConfidentialityMeasureCategory>;
  in?: Maybe<Array<Maybe<ConfidentialityMeasureCategory>>>;
  notIn?: Maybe<Array<Maybe<ConfidentialityMeasureCategory>>>;
};

export type ConfidentialityMeasureCreateInput = {
  category: ConfidentialityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type ConfidentialityMeasureFilter = {
  id?: Maybe<Scalars['ID']>;
  category?: Maybe<ConfidentialityMeasureCategoryFilter>;
  name?: Maybe<Scalars['String']>;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
};

export type ConfidentialityMeasureUpdateInput = {
  id: Scalars['ID'];
  category: ConfidentialityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataAtom = {
  __typename?: 'DataAtom';
  id: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  processingActivity?: Maybe<ProcessingActivity>;
  personCategories?: Maybe<Array<Maybe<PersonCategory>>>;
  dataCategories?: Maybe<Array<Maybe<DataCategory>>>;
};

export type DataAtomCreateInput = {
  description?: Maybe<Scalars['String']>;
  processingActivityId?: Maybe<Scalars['ID']>;
  personCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  dataCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataAtomUpdateInput = {
  id: Scalars['ID'];
  description?: Maybe<Scalars['String']>;
  processingActivityId?: Maybe<Scalars['ID']>;
  personCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
  dataCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataCategory = {
  __typename?: 'DataCategory';
  id: Scalars['ID'];
  name: Scalars['String'];
  industries?: Maybe<Array<Maybe<Industry>>>;
};

export type DataCategoryCreateInput = {
  name: Scalars['String'];
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataCategoryFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
};

export type DataCategoryUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataSecurityMeasure = {
  id: Scalars['ID'];
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategories?: Maybe<Array<Maybe<DataSecurityMeasureCategory>>>;
  measureApplications?: Maybe<Array<Maybe<MeasureApplication>>>;
};

export type DataSecurityMeasureCategory = {
  __typename?: 'DataSecurityMeasureCategory';
  id: Scalars['ID'];
  name: Scalars['String'];
  industries?: Maybe<Array<Maybe<Industry>>>;
};

export type DataSecurityMeasureCategoryCreateInput = {
  name: Scalars['String'];
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataSecurityMeasureCategoryFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
};

export type DataSecurityMeasureCategoryUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type DataSecurityMeasureFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
  impact?: Maybe<PriorityFilter>;
  description?: Maybe<StringFilter>;
};

export enum DataSecurityMeasureTypes {
  AvailabilityMeasure = 'AvailabilityMeasure',
  FormalMeasure = 'FormalMeasure',
  ConfidentialityMeasure = 'ConfidentialityMeasure',
  IntegrityMeasure = 'IntegrityMeasure'
}

export type DataSecurityRequirement = {
  __typename?: 'DataSecurityRequirement';
  id: Scalars['ID'];
  specific?: Maybe<SecuritySpecifics>;
  description?: Maybe<Scalars['String']>;
  /** if set this value will override the priority from RiskAssessment */
  priority?: Maybe<Priority>;
  riskAssessment?: Maybe<RiskAssessment>;
  dataSecurityRiskSource?: Maybe<DataSecurityRiskSource>;
};

export type DataSecurityRequirementCreateInput = {
  specific?: Maybe<SecuritySpecifics>;
  description?: Maybe<Scalars['String']>;
  /** if set this value will override the priority from RiskAssessment */
  priority?: Maybe<Priority>;
  riskAssessmentId?: Maybe<Scalars['ID']>;
  dataSecurityRiskSourceId?: Maybe<Scalars['ID']>;
  dataSecurityRiskSourceType?: Maybe<DataSecurityRiskSourceTypes>;
};

export type DataSecurityRequirementFilter = {
  id?: Maybe<Scalars['ID']>;
  specific?: Maybe<SecuritySpecificsFilter>;
  description?: Maybe<StringFilter>;
  priority?: Maybe<PriorityFilter>;
};

export type DataSecurityRequirementUpdateInput = {
  id: Scalars['ID'];
  specific?: Maybe<SecuritySpecifics>;
  description?: Maybe<Scalars['String']>;
  /** if set this value will override the priority from RiskAssessment */
  priority?: Maybe<Priority>;
  riskAssessmentId?: Maybe<Scalars['ID']>;
  dataSecurityRiskSourceId?: Maybe<Scalars['ID']>;
  dataSecurityRiskSourceType?: Maybe<DataSecurityRiskSourceTypes>;
};

export type DataSecurityRiskSource = DataAtom | ProcessingActivity | OrganisationalUnit | Organisation;

export type DataSecurityRiskSourceFilter = {
  id?: Maybe<Scalars['ID']>;
};

export enum DataSecurityRiskSourceTypes {
  DataAtom = 'DataAtom',
  ProcessingActivity = 'ProcessingActivity',
  OrganisationalUnit = 'OrganisationalUnit',
  Organisation = 'Organisation'
}

export type EmployeeInformation = {
  __typename?: 'EmployeeInformation';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  informable?: Maybe<Informable>;
};

export type EmployeeInformationCreateInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  informableId?: Maybe<Scalars['ID']>;
  informableType?: Maybe<InformableTypes>;
};

export type EmployeeInformationFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
  description?: Maybe<StringFilter>;
};

export type EmployeeInformationUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  informableId?: Maybe<Scalars['ID']>;
  informableType?: Maybe<InformableTypes>;
};

export type FormalMeasure = DataSecurityMeasure & {
  __typename?: 'FormalMeasure';
  id: Scalars['ID'];
  category: FormalMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategories?: Maybe<Array<Maybe<DataSecurityMeasureCategory>>>;
  measureApplications?: Maybe<Array<Maybe<MeasureApplication>>>;
};

export enum FormalMeasureCategory {
  Agreement = 'AGREEMENT',
  Management = 'MANAGEMENT',
  Intervenibility = 'INTERVENIBILITY',
  Transparency = 'TRANSPARENCY',
  DataMinimisation = 'DATA_MINIMISATION',
  UnlinkedPurposes = 'UNLINKED_PURPOSES'
}

export type FormalMeasureCategoryFilter = {
  ne?: Maybe<FormalMeasureCategory>;
  eq?: Maybe<FormalMeasureCategory>;
  in?: Maybe<Array<Maybe<FormalMeasureCategory>>>;
  notIn?: Maybe<Array<Maybe<FormalMeasureCategory>>>;
};

export type FormalMeasureCreateInput = {
  category: FormalMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type FormalMeasureFilter = {
  id?: Maybe<Scalars['ID']>;
  category?: Maybe<FormalMeasureCategoryFilter>;
  name?: Maybe<Scalars['String']>;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
};

export type FormalMeasureUpdateInput = {
  id: Scalars['ID'];
  category: FormalMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type Industry = {
  __typename?: 'Industry';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type IndustryCreateInput = {
  name: Scalars['String'];
};

export type IndustryFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
};

export type IndustryUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Informable = AvailabilityMeasure | FormalMeasure | ConfidentialityMeasure | IntegrityMeasure | MeasureApplication;

export type InformableFilter = {
  id?: Maybe<Scalars['ID']>;
};

export enum InformableTypes {
  AvailabilityMeasure = 'AvailabilityMeasure',
  FormalMeasure = 'FormalMeasure',
  ConfidentialityMeasure = 'ConfidentialityMeasure',
  IntegrityMeasure = 'IntegrityMeasure',
  MeasureApplication = 'MeasureApplication'
}

export type IntegrityMeasure = DataSecurityMeasure & {
  __typename?: 'IntegrityMeasure';
  id: Scalars['ID'];
  category: IntegrityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategories?: Maybe<Array<Maybe<DataSecurityMeasureCategory>>>;
  measureApplications?: Maybe<Array<Maybe<MeasureApplication>>>;
};

export enum IntegrityMeasureCategory {
  InputControl = 'INPUT_CONTROL'
}

export type IntegrityMeasureCategoryFilter = {
  ne?: Maybe<IntegrityMeasureCategory>;
  eq?: Maybe<IntegrityMeasureCategory>;
  in?: Maybe<Array<Maybe<IntegrityMeasureCategory>>>;
  notIn?: Maybe<Array<Maybe<IntegrityMeasureCategory>>>;
};

export type IntegrityMeasureCreateInput = {
  category: IntegrityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type IntegrityMeasureFilter = {
  id?: Maybe<Scalars['ID']>;
  category?: Maybe<IntegrityMeasureCategoryFilter>;
  name?: Maybe<Scalars['String']>;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
};

export type IntegrityMeasureUpdateInput = {
  id: Scalars['ID'];
  category: IntegrityMeasureCategory;
  name: Scalars['String'];
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureCategoryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type IntFilter = {
  /** equal */
  eq?: Maybe<Scalars['Int']>;
  /** not equal */
  ne?: Maybe<Scalars['Int']>;
  /** lower or equal than */
  le?: Maybe<Scalars['Int']>;
  /** lower than */
  lt?: Maybe<Scalars['Int']>;
  /** greater or equal than */
  ge?: Maybe<Scalars['Int']>;
  /** greater than */
  gt?: Maybe<Scalars['Int']>;
  /** is in list of numbers */
  isIn?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /** is not in list of numbers */
  notIn?: Maybe<Array<Maybe<Scalars['Int']>>>;
  /** is greater or equal than the first and lower then the last number of a list */
  between?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type MeasureApplication = {
  __typename?: 'MeasureApplication';
  id: Scalars['ID'];
  status: MeasureApplicationStatus;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasure?: Maybe<DataSecurityMeasure>;
};

export type MeasureApplicationCreateInput = {
  status: MeasureApplicationStatus;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureId?: Maybe<Scalars['ID']>;
  dataSecurityMeasureType?: Maybe<DataSecurityMeasureTypes>;
};

export type MeasureApplicationFilter = {
  id?: Maybe<Scalars['ID']>;
  status?: Maybe<MeasureApplicationStatusFilter>;
  impact?: Maybe<PriorityFilter>;
  description?: Maybe<StringFilter>;
};

export enum MeasureApplicationStatus {
  Current = 'CURRENT',
  Planned = 'PLANNED',
  Required = 'REQUIRED'
}

export type MeasureApplicationStatusFilter = {
  ne?: Maybe<MeasureApplicationStatus>;
  eq?: Maybe<MeasureApplicationStatus>;
  in?: Maybe<Array<Maybe<MeasureApplicationStatus>>>;
  notIn?: Maybe<Array<Maybe<MeasureApplicationStatus>>>;
};

export type MeasureApplicationUpdateInput = {
  id: Scalars['ID'];
  status: MeasureApplicationStatus;
  impact?: Maybe<Priority>;
  description?: Maybe<Scalars['String']>;
  dataSecurityMeasureId?: Maybe<Scalars['ID']>;
  dataSecurityMeasureType?: Maybe<DataSecurityMeasureTypes>;
};

export type MetaData = {
  __typename?: 'metaData';
  name?: Maybe<Scalars['String']>;
  rootQuery?: Maybe<Scalars['Boolean']>;
  path?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  parent?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  ping?: Maybe<Scalars['String']>;
  seed?: Maybe<Scalars['String']>;
  createDataSecurityMeasureCategory?: Maybe<SaveDataSecurityMeasureCategoryMutationResult>;
  updateDataSecurityMeasureCategory?: Maybe<SaveDataSecurityMeasureCategoryMutationResult>;
  deleteDataSecurityMeasureCategory?: Maybe<Scalars['Boolean']>;
  deleteDataSecurityMeasure?: Maybe<Scalars['Boolean']>;
  createAvailabilityMeasure?: Maybe<SaveAvailabilityMeasureMutationResult>;
  updateAvailabilityMeasure?: Maybe<SaveAvailabilityMeasureMutationResult>;
  deleteAvailabilityMeasure?: Maybe<Scalars['Boolean']>;
  createFormalMeasure?: Maybe<SaveFormalMeasureMutationResult>;
  updateFormalMeasure?: Maybe<SaveFormalMeasureMutationResult>;
  deleteFormalMeasure?: Maybe<Scalars['Boolean']>;
  createConfidentialityMeasure?: Maybe<SaveConfidentialityMeasureMutationResult>;
  updateConfidentialityMeasure?: Maybe<SaveConfidentialityMeasureMutationResult>;
  deleteConfidentialityMeasure?: Maybe<Scalars['Boolean']>;
  createIntegrityMeasure?: Maybe<SaveIntegrityMeasureMutationResult>;
  updateIntegrityMeasure?: Maybe<SaveIntegrityMeasureMutationResult>;
  deleteIntegrityMeasure?: Maybe<Scalars['Boolean']>;
  createRiskAssessment?: Maybe<SaveRiskAssessmentMutationResult>;
  updateRiskAssessment?: Maybe<SaveRiskAssessmentMutationResult>;
  deleteRiskAssessment?: Maybe<Scalars['Boolean']>;
  createDataSecurityRequirement?: Maybe<SaveDataSecurityRequirementMutationResult>;
  updateDataSecurityRequirement?: Maybe<SaveDataSecurityRequirementMutationResult>;
  deleteDataSecurityRequirement?: Maybe<Scalars['Boolean']>;
  createPersonCategory?: Maybe<SavePersonCategoryMutationResult>;
  updatePersonCategory?: Maybe<SavePersonCategoryMutationResult>;
  deletePersonCategory?: Maybe<Scalars['Boolean']>;
  createDataCategory?: Maybe<SaveDataCategoryMutationResult>;
  updateDataCategory?: Maybe<SaveDataCategoryMutationResult>;
  deleteDataCategory?: Maybe<Scalars['Boolean']>;
  deleteDataSecurityRiskSource?: Maybe<Scalars['Boolean']>;
  createDataAtom?: Maybe<SaveDataAtomMutationResult>;
  updateDataAtom?: Maybe<SaveDataAtomMutationResult>;
  deleteDataAtom?: Maybe<Scalars['Boolean']>;
  createProcessingActivity?: Maybe<SaveProcessingActivityMutationResult>;
  updateProcessingActivity?: Maybe<SaveProcessingActivityMutationResult>;
  deleteProcessingActivity?: Maybe<Scalars['Boolean']>;
  createOrganisationalUnit?: Maybe<SaveOrganisationalUnitMutationResult>;
  updateOrganisationalUnit?: Maybe<SaveOrganisationalUnitMutationResult>;
  deleteOrganisationalUnit?: Maybe<Scalars['Boolean']>;
  createOrganisation?: Maybe<SaveOrganisationMutationResult>;
  updateOrganisation?: Maybe<SaveOrganisationMutationResult>;
  deleteOrganisation?: Maybe<Scalars['Boolean']>;
  createClient?: Maybe<SaveClientMutationResult>;
  updateClient?: Maybe<SaveClientMutationResult>;
  deleteClient?: Maybe<Scalars['Boolean']>;
  deleteInformable?: Maybe<Scalars['Boolean']>;
  createEmployeeInformation?: Maybe<SaveEmployeeInformationMutationResult>;
  updateEmployeeInformation?: Maybe<SaveEmployeeInformationMutationResult>;
  deleteEmployeeInformation?: Maybe<Scalars['Boolean']>;
  createIndustry?: Maybe<SaveIndustryMutationResult>;
  updateIndustry?: Maybe<SaveIndustryMutationResult>;
  deleteIndustry?: Maybe<Scalars['Boolean']>;
  createMeasureApplication?: Maybe<SaveMeasureApplicationMutationResult>;
  updateMeasureApplication?: Maybe<SaveMeasureApplicationMutationResult>;
  deleteMeasureApplication?: Maybe<Scalars['Boolean']>;
};


export type MutationPingArgs = {
  some?: Maybe<Scalars['String']>;
};


export type MutationSeedArgs = {
  truncate?: Maybe<Scalars['Boolean']>;
};


export type MutationCreateDataSecurityMeasureCategoryArgs = {
  dataSecurityMeasureCategory?: Maybe<DataSecurityMeasureCategoryCreateInput>;
};


export type MutationUpdateDataSecurityMeasureCategoryArgs = {
  dataSecurityMeasureCategory?: Maybe<DataSecurityMeasureCategoryUpdateInput>;
};


export type MutationDeleteDataSecurityMeasureCategoryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationDeleteDataSecurityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateAvailabilityMeasureArgs = {
  availabilityMeasure?: Maybe<AvailabilityMeasureCreateInput>;
};


export type MutationUpdateAvailabilityMeasureArgs = {
  availabilityMeasure?: Maybe<AvailabilityMeasureUpdateInput>;
};


export type MutationDeleteAvailabilityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateFormalMeasureArgs = {
  formalMeasure?: Maybe<FormalMeasureCreateInput>;
};


export type MutationUpdateFormalMeasureArgs = {
  formalMeasure?: Maybe<FormalMeasureUpdateInput>;
};


export type MutationDeleteFormalMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateConfidentialityMeasureArgs = {
  confidentialityMeasure?: Maybe<ConfidentialityMeasureCreateInput>;
};


export type MutationUpdateConfidentialityMeasureArgs = {
  confidentialityMeasure?: Maybe<ConfidentialityMeasureUpdateInput>;
};


export type MutationDeleteConfidentialityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateIntegrityMeasureArgs = {
  integrityMeasure?: Maybe<IntegrityMeasureCreateInput>;
};


export type MutationUpdateIntegrityMeasureArgs = {
  integrityMeasure?: Maybe<IntegrityMeasureUpdateInput>;
};


export type MutationDeleteIntegrityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateRiskAssessmentArgs = {
  riskAssessment?: Maybe<RiskAssessmentCreateInput>;
};


export type MutationUpdateRiskAssessmentArgs = {
  riskAssessment?: Maybe<RiskAssessmentUpdateInput>;
};


export type MutationDeleteRiskAssessmentArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateDataSecurityRequirementArgs = {
  dataSecurityRequirement?: Maybe<DataSecurityRequirementCreateInput>;
};


export type MutationUpdateDataSecurityRequirementArgs = {
  dataSecurityRequirement?: Maybe<DataSecurityRequirementUpdateInput>;
};


export type MutationDeleteDataSecurityRequirementArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreatePersonCategoryArgs = {
  personCategory?: Maybe<PersonCategoryCreateInput>;
};


export type MutationUpdatePersonCategoryArgs = {
  personCategory?: Maybe<PersonCategoryUpdateInput>;
};


export type MutationDeletePersonCategoryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateDataCategoryArgs = {
  dataCategory?: Maybe<DataCategoryCreateInput>;
};


export type MutationUpdateDataCategoryArgs = {
  dataCategory?: Maybe<DataCategoryUpdateInput>;
};


export type MutationDeleteDataCategoryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationDeleteDataSecurityRiskSourceArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateDataAtomArgs = {
  dataAtom?: Maybe<DataAtomCreateInput>;
};


export type MutationUpdateDataAtomArgs = {
  dataAtom?: Maybe<DataAtomUpdateInput>;
};


export type MutationDeleteDataAtomArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateProcessingActivityArgs = {
  processingActivity?: Maybe<ProcessingActivityCreateInput>;
};


export type MutationUpdateProcessingActivityArgs = {
  processingActivity?: Maybe<ProcessingActivityUpdateInput>;
};


export type MutationDeleteProcessingActivityArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateOrganisationalUnitArgs = {
  organisationalUnit?: Maybe<OrganisationalUnitCreateInput>;
};


export type MutationUpdateOrganisationalUnitArgs = {
  organisationalUnit?: Maybe<OrganisationalUnitUpdateInput>;
};


export type MutationDeleteOrganisationalUnitArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateOrganisationArgs = {
  organisation?: Maybe<OrganisationCreateInput>;
};


export type MutationUpdateOrganisationArgs = {
  organisation?: Maybe<OrganisationUpdateInput>;
};


export type MutationDeleteOrganisationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateClientArgs = {
  client?: Maybe<ClientCreateInput>;
};


export type MutationUpdateClientArgs = {
  client?: Maybe<ClientUpdateInput>;
};


export type MutationDeleteClientArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationDeleteInformableArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateEmployeeInformationArgs = {
  employeeInformation?: Maybe<EmployeeInformationCreateInput>;
};


export type MutationUpdateEmployeeInformationArgs = {
  employeeInformation?: Maybe<EmployeeInformationUpdateInput>;
};


export type MutationDeleteEmployeeInformationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateIndustryArgs = {
  industry?: Maybe<IndustryCreateInput>;
};


export type MutationUpdateIndustryArgs = {
  industry?: Maybe<IndustryUpdateInput>;
};


export type MutationDeleteIndustryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type MutationCreateMeasureApplicationArgs = {
  measureApplication?: Maybe<MeasureApplicationCreateInput>;
};


export type MutationUpdateMeasureApplicationArgs = {
  measureApplication?: Maybe<MeasureApplicationUpdateInput>;
};


export type MutationDeleteMeasureApplicationArgs = {
  id?: Maybe<Scalars['ID']>;
};

export type Organisation = {
  __typename?: 'Organisation';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  client?: Maybe<Client>;
  industries?: Maybe<Array<Maybe<Industry>>>;
  organisationalUnits?: Maybe<Array<Maybe<OrganisationalUnit>>>;
  processingActivities?: Maybe<Array<Maybe<ProcessingActivity>>>;
};

export type OrganisationalUnit = {
  __typename?: 'OrganisationalUnit';
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  organisation?: Maybe<Organisation>;
  processingActivities?: Maybe<Array<Maybe<ProcessingActivity>>>;
};

export type OrganisationalUnitCreateInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  organisationId?: Maybe<Scalars['ID']>;
};

export type OrganisationalUnitFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
  description?: Maybe<StringFilter>;
};

export type OrganisationalUnitUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  organisationId?: Maybe<Scalars['ID']>;
};

export type OrganisationCreateInput = {
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['ID']>;
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type OrganisationFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
  description?: Maybe<StringFilter>;
};

export type OrganisationUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  clientId?: Maybe<Scalars['ID']>;
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type PersonCategory = {
  __typename?: 'PersonCategory';
  id: Scalars['ID'];
  name: Scalars['String'];
  industries?: Maybe<Array<Maybe<Industry>>>;
};

export type PersonCategoryCreateInput = {
  name: Scalars['String'];
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type PersonCategoryFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
};

export type PersonCategoryUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  industryIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export enum Priority {
  Normal = 'NORMAL',
  High = 'HIGH',
  VeryHigh = 'VERY_HIGH'
}

export type PriorityFilter = {
  ne?: Maybe<Priority>;
  eq?: Maybe<Priority>;
  in?: Maybe<Array<Maybe<Priority>>>;
  notIn?: Maybe<Array<Maybe<Priority>>>;
};

export type ProcessingActivity = {
  __typename?: 'ProcessingActivity';
  id: Scalars['ID'];
  name: Scalars['String'];
  purpose?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  organisation?: Maybe<Organisation>;
  organisationalUnits?: Maybe<Array<Maybe<OrganisationalUnit>>>;
  dataAtoms?: Maybe<Array<Maybe<DataAtom>>>;
};

export type ProcessingActivityCreateInput = {
  name: Scalars['String'];
  purpose?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  organisationId?: Maybe<Scalars['ID']>;
  organisationalUnitIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type ProcessingActivityFilter = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<StringFilter>;
  purpose?: Maybe<StringFilter>;
  description?: Maybe<StringFilter>;
};

export type ProcessingActivityUpdateInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  purpose?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  organisationId?: Maybe<Scalars['ID']>;
  organisationalUnitIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type Query = {
  __typename?: 'Query';
  ping?: Maybe<Scalars['String']>;
  metaData?: Maybe<Array<Maybe<MetaData>>>;
  dataSecurityMeasureCategory?: Maybe<DataSecurityMeasureCategory>;
  dataSecurityMeasureCategories?: Maybe<Array<Maybe<DataSecurityMeasureCategory>>>;
  dataSecurityMeasures?: Maybe<Array<Maybe<DataSecurityMeasure>>>;
  availabilityMeasure?: Maybe<AvailabilityMeasure>;
  availabilityMeasures?: Maybe<Array<Maybe<AvailabilityMeasure>>>;
  formalMeasure?: Maybe<FormalMeasure>;
  formalMeasures?: Maybe<Array<Maybe<FormalMeasure>>>;
  confidentialityMeasure?: Maybe<ConfidentialityMeasure>;
  confidentialityMeasures?: Maybe<Array<Maybe<ConfidentialityMeasure>>>;
  integrityMeasure?: Maybe<IntegrityMeasure>;
  integrityMeasures?: Maybe<Array<Maybe<IntegrityMeasure>>>;
  riskAssessment?: Maybe<RiskAssessment>;
  riskAssessments?: Maybe<Array<Maybe<RiskAssessment>>>;
  dataSecurityRequirement?: Maybe<DataSecurityRequirement>;
  dataSecurityRequirements?: Maybe<Array<Maybe<DataSecurityRequirement>>>;
  personCategory?: Maybe<PersonCategory>;
  personCategories?: Maybe<Array<Maybe<PersonCategory>>>;
  dataCategory?: Maybe<DataCategory>;
  dataCategories?: Maybe<Array<Maybe<DataCategory>>>;
  dataSecurityRiskSources?: Maybe<Array<Maybe<DataSecurityRiskSource>>>;
  processingActivity?: Maybe<ProcessingActivity>;
  processingActivities?: Maybe<Array<Maybe<ProcessingActivity>>>;
  organisationalUnit?: Maybe<OrganisationalUnit>;
  organisationalUnits?: Maybe<Array<Maybe<OrganisationalUnit>>>;
  organisation?: Maybe<Organisation>;
  organisations?: Maybe<Array<Maybe<Organisation>>>;
  client?: Maybe<Client>;
  clients?: Maybe<Array<Maybe<Client>>>;
  informables?: Maybe<Array<Maybe<Informable>>>;
  employeeInformation?: Maybe<EmployeeInformation>;
  employeeInformations?: Maybe<Array<Maybe<EmployeeInformation>>>;
  industry?: Maybe<Industry>;
  industries?: Maybe<Array<Maybe<Industry>>>;
  measureApplication?: Maybe<MeasureApplication>;
  measureApplications?: Maybe<Array<Maybe<MeasureApplication>>>;
};


export type QueryDataSecurityMeasureCategoryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryDataSecurityMeasureCategoriesArgs = {
  filter?: Maybe<DataSecurityMeasureCategoryFilter>;
};


export type QueryDataSecurityMeasuresArgs = {
  filter?: Maybe<DataSecurityMeasureFilter>;
};


export type QueryAvailabilityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryAvailabilityMeasuresArgs = {
  filter?: Maybe<AvailabilityMeasureFilter>;
};


export type QueryFormalMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryFormalMeasuresArgs = {
  filter?: Maybe<FormalMeasureFilter>;
};


export type QueryConfidentialityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryConfidentialityMeasuresArgs = {
  filter?: Maybe<ConfidentialityMeasureFilter>;
};


export type QueryIntegrityMeasureArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryIntegrityMeasuresArgs = {
  filter?: Maybe<IntegrityMeasureFilter>;
};


export type QueryRiskAssessmentArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryRiskAssessmentsArgs = {
  filter?: Maybe<RiskAssessmentFilter>;
};


export type QueryDataSecurityRequirementArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryDataSecurityRequirementsArgs = {
  filter?: Maybe<DataSecurityRequirementFilter>;
};


export type QueryPersonCategoryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryPersonCategoriesArgs = {
  filter?: Maybe<PersonCategoryFilter>;
};


export type QueryDataCategoryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryDataCategoriesArgs = {
  filter?: Maybe<DataCategoryFilter>;
};


export type QueryDataSecurityRiskSourcesArgs = {
  filter?: Maybe<DataSecurityRiskSourceFilter>;
};


export type QueryProcessingActivityArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryProcessingActivitiesArgs = {
  filter?: Maybe<ProcessingActivityFilter>;
};


export type QueryOrganisationalUnitArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryOrganisationalUnitsArgs = {
  filter?: Maybe<OrganisationalUnitFilter>;
};


export type QueryOrganisationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryOrganisationsArgs = {
  filter?: Maybe<OrganisationFilter>;
};


export type QueryClientArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryClientsArgs = {
  filter?: Maybe<ClientFilter>;
};


export type QueryInformablesArgs = {
  filter?: Maybe<InformableFilter>;
};


export type QueryEmployeeInformationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryEmployeeInformationsArgs = {
  filter?: Maybe<EmployeeInformationFilter>;
};


export type QueryIndustryArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryIndustriesArgs = {
  filter?: Maybe<IndustryFilter>;
};


export type QueryMeasureApplicationArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryMeasureApplicationsArgs = {
  filter?: Maybe<MeasureApplicationFilter>;
};

/**
 * Used to asses a risk priority by the calculation: probability x damage
 *   1 - 3 normal
 *   4 - 8 high
 *   8 ..  very high
 * Asses the risk at the absence of any of the the special measures. It is assumed
 * that basic "measures" (e.g. Password protected PC, Simple lock in doors) exist.
 * If the assumptions are not realistic - it will be documented.
 */
export type RiskAssessment = {
  __typename?: 'RiskAssessment';
  id: Scalars['ID'];
  /** This attribute should be resolved via attribute resolver, but none was provided. */
  priority?: Maybe<Scalars['String']>;
  probability: Scalars['Int'];
  /** Reasoning why a certain probability is assumed */
  probabilityDescription?: Maybe<Scalars['String']>;
  damage: Scalars['Int'];
  /** Reasoning why a certain damage is assumed */
  damageDescription?: Maybe<Scalars['String']>;
};

export type RiskAssessmentCreateInput = {
  probability: Scalars['Int'];
  /** Reasoning why a certain probability is assumed */
  probabilityDescription?: Maybe<Scalars['String']>;
  damage: Scalars['Int'];
  /** Reasoning why a certain damage is assumed */
  damageDescription?: Maybe<Scalars['String']>;
};

export type RiskAssessmentFilter = {
  id?: Maybe<Scalars['ID']>;
  probability?: Maybe<IntFilter>;
  probabilityDescription?: Maybe<StringFilter>;
  damage?: Maybe<IntFilter>;
  damageDescription?: Maybe<StringFilter>;
};

export type RiskAssessmentUpdateInput = {
  id: Scalars['ID'];
  probability: Scalars['Int'];
  /** Reasoning why a certain probability is assumed */
  probabilityDescription?: Maybe<Scalars['String']>;
  damage: Scalars['Int'];
  /** Reasoning why a certain damage is assumed */
  damageDescription?: Maybe<Scalars['String']>;
};

export type SaveAvailabilityMeasureMutationResult = {
  __typename?: 'SaveAvailabilityMeasureMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  availabilityMeasure?: Maybe<AvailabilityMeasure>;
};

export type SaveClientMutationResult = {
  __typename?: 'SaveClientMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  client?: Maybe<Client>;
};

export type SaveConfidentialityMeasureMutationResult = {
  __typename?: 'SaveConfidentialityMeasureMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  confidentialityMeasure?: Maybe<ConfidentialityMeasure>;
};

export type SaveDataAtomMutationResult = {
  __typename?: 'SaveDataAtomMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  dataAtom?: Maybe<DataAtom>;
};

export type SaveDataCategoryMutationResult = {
  __typename?: 'SaveDataCategoryMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  dataCategory?: Maybe<DataCategory>;
};

export type SaveDataSecurityMeasureCategoryMutationResult = {
  __typename?: 'SaveDataSecurityMeasureCategoryMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  dataSecurityMeasureCategory?: Maybe<DataSecurityMeasureCategory>;
};

export type SaveDataSecurityRequirementMutationResult = {
  __typename?: 'SaveDataSecurityRequirementMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  dataSecurityRequirement?: Maybe<DataSecurityRequirement>;
};

export type SaveEmployeeInformationMutationResult = {
  __typename?: 'SaveEmployeeInformationMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  employeeInformation?: Maybe<EmployeeInformation>;
};

export type SaveFormalMeasureMutationResult = {
  __typename?: 'SaveFormalMeasureMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  formalMeasure?: Maybe<FormalMeasure>;
};

export type SaveIndustryMutationResult = {
  __typename?: 'SaveIndustryMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  industry?: Maybe<Industry>;
};

export type SaveIntegrityMeasureMutationResult = {
  __typename?: 'SaveIntegrityMeasureMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  integrityMeasure?: Maybe<IntegrityMeasure>;
};

export type SaveMeasureApplicationMutationResult = {
  __typename?: 'SaveMeasureApplicationMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  measureApplication?: Maybe<MeasureApplication>;
};

export type SaveOrganisationalUnitMutationResult = {
  __typename?: 'SaveOrganisationalUnitMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  organisationalUnit?: Maybe<OrganisationalUnit>;
};

export type SaveOrganisationMutationResult = {
  __typename?: 'SaveOrganisationMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  organisation?: Maybe<Organisation>;
};

export type SavePersonCategoryMutationResult = {
  __typename?: 'SavePersonCategoryMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  personCategory?: Maybe<PersonCategory>;
};

export type SaveProcessingActivityMutationResult = {
  __typename?: 'SaveProcessingActivityMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  processingActivity?: Maybe<ProcessingActivity>;
};

export type SaveRiskAssessmentMutationResult = {
  __typename?: 'SaveRiskAssessmentMutationResult';
  validationViolations: Array<Maybe<ValidationViolation>>;
  riskAssessment?: Maybe<RiskAssessment>;
};

export enum SecuritySpecifics {
  Confidantality = 'CONFIDANTALITY',
  Integrity = 'INTEGRITY',
  Availability = 'AVAILABILITY',
  Formal = 'FORMAL'
}

export type SecuritySpecificsFilter = {
  ne?: Maybe<SecuritySpecifics>;
  eq?: Maybe<SecuritySpecifics>;
  in?: Maybe<Array<Maybe<SecuritySpecifics>>>;
  notIn?: Maybe<Array<Maybe<SecuritySpecifics>>>;
};

export type StringFilter = {
  is?: Maybe<Scalars['String']>;
  isNot?: Maybe<Scalars['String']>;
  in?: Maybe<Array<Maybe<Scalars['String']>>>;
  notIn?: Maybe<Array<Maybe<Scalars['String']>>>;
  contains?: Maybe<Scalars['String']>;
  doesNotContain?: Maybe<Scalars['String']>;
  beginsWith?: Maybe<Scalars['String']>;
  endsWith?: Maybe<Scalars['String']>;
  caseSensitive?: Maybe<Scalars['Boolean']>;
};

export type ValidationViolation = {
  __typename?: 'ValidationViolation';
  attribute?: Maybe<Scalars['String']>;
  violation: Scalars['String'];
};

export type ClientOverviewQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ClientOverviewQuery = (
  { __typename?: 'Query' }
  & { client?: Maybe<(
    { __typename?: 'Client' }
    & Pick<Client, 'id' | 'name' | 'city' | 'dsb' | 'zip' | 'address1' | 'address2' | 'country'>
    & { organisations?: Maybe<Array<Maybe<(
      { __typename?: 'Organisation' }
      & Pick<Organisation, 'id' | 'name' | 'description'>
    )>>> }
  )> }
);

export type AllClientsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllClientsQuery = (
  { __typename?: 'Query' }
  & { clients?: Maybe<Array<Maybe<(
    { __typename?: 'Client' }
    & Pick<Client, 'id' | 'name' | 'city' | 'dsb'>
  )>>> }
);

export type OrganisationOverviewQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type OrganisationOverviewQuery = (
  { __typename?: 'Query' }
  & { organisation?: Maybe<(
    { __typename?: 'Organisation' }
    & Pick<Organisation, 'id' | 'name' | 'description'>
    & { industries?: Maybe<Array<Maybe<(
      { __typename?: 'Industry' }
      & Pick<Industry, 'name'>
    )>>>, client?: Maybe<(
      { __typename?: 'Client' }
      & Pick<Client, 'name' | 'city' | 'dsb'>
    )>, organisationalUnits?: Maybe<Array<Maybe<(
      { __typename?: 'OrganisationalUnit' }
      & Pick<OrganisationalUnit, 'id' | 'name'>
    )>>> }
  )> }
);

export type OrganisationsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganisationsQuery = (
  { __typename?: 'Query' }
  & { organisations?: Maybe<Array<Maybe<(
    { __typename?: 'Organisation' }
    & Pick<Organisation, 'id' | 'name'>
    & { industries?: Maybe<Array<Maybe<(
      { __typename?: 'Industry' }
      & Pick<Industry, 'name'>
    )>>>, client?: Maybe<(
      { __typename?: 'Client' }
      & Pick<Client, 'id' | 'name' | 'city'>
    )> }
  )>>> }
);

export const ClientOverviewDocument = gql`
    query ClientOverview($id: ID!) {
  client(id: $id) {
    id
    name
    city
    dsb
    zip
    address1
    address2
    country
    organisations {
      id
      name
      description
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class ClientOverviewGQL extends Apollo.Query<ClientOverviewQuery, ClientOverviewQueryVariables> {
    document = ClientOverviewDocument;
    
  }
export const AllClientsDocument = gql`
    query AllClients {
  clients {
    id
    name
    city
    dsb
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class AllClientsGQL extends Apollo.Query<AllClientsQuery, AllClientsQueryVariables> {
    document = AllClientsDocument;
    
  }
export const OrganisationOverviewDocument = gql`
    query OrganisationOverview($id: ID!) {
  organisation(id: $id) {
    id
    name
    description
    industries {
      name
    }
    client {
      name
      city
      dsb
    }
    organisationalUnits {
      id
      name
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class OrganisationOverviewGQL extends Apollo.Query<OrganisationOverviewQuery, OrganisationOverviewQueryVariables> {
    document = OrganisationOverviewDocument;
    
  }
export const OrganisationsDocument = gql`
    query Organisations {
  organisations {
    id
    name
    industries {
      name
    }
    client {
      id
      name
      city
    }
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class OrganisationsGQL extends Apollo.Query<OrganisationsQuery, OrganisationsQueryVariables> {
    document = OrganisationsDocument;
    
  }