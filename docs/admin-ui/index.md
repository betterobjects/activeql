---
layout: page
title: Admin UI
permalink: /admin-ui
has_children: false
nav_order: 20
---

# Admin UI

ActiveQL comes with an Angular application that offers basic (CRUD) admin operation with the entity data.

## Actions

Based on _conventions_ the Admin UI offers views for 

| action | view | url |
|-|-|-|
| index| list or table of enity data  | /[prefix]/[entity-path] |
| show | detail view of enity data  | /[prefix]/[entity-path]/show/[entity-id] |
| edit | edit view of enity data  | /[prefix]/[entity-path]/edit/[entity-id] |
| create | create view of enity data  | /[prefix]/[entity-path]/new |

The placeholders are resolved as 

| placeholder | configuration | default value |
|-|-|-|
| prefix  | `adminConfig.adminLinkPrefix` | `admin` |
| path    | `EntityConfig.path` | plural of entity-name, lower-letters, dasherized  <br> e.g. entity: `VehicleFleet`  path: `vehicle-fleets` |


## Entity Relations

### assocTo

| action | display |
|-|-|
| index  | column with the `indication` data as link to the `show` view of the related entity item |
| show   | row with the `indication` data as link to the `show` view of the related entity item |
| edit   | dropdown with the `indication` data of all items of the releated entity |
| create | dropdown with the `indication` data of all items of the releated entity |

### assocToMany

| action | display |
|-|-|
| index  | column with comma-separated `indication` datas as link to the `show` view of the related entity item(s)  |
| show   | row with the `indication` data as link to the `show` view of the related entity item(s)  |
| edit   | multiselect with the `indication` data of all items of the releated entity |
| create | multiselect with the `indication` data of all items of the releated entity |

### assocFrom

| action | display |
|-|-|
| index  | not shown |
| show   | table with all related entity items, link to child-items |
| edit   | not shown |
| create | not shown |

## Parent - Child

When you follow an `assocFrom` relationship from the `show` view of an entity - the selected entity item is shown as the child of the orgin entity item.

The `urls` will look like 

| action | view | url |
|-|-|-|
| index | without the `assocTo` column | /[prefix]/[parent-entity-path]/[parent-entity-id]/[entity-path] |
| show | without the `assocTo` row  | /[prefix]/[parent-entity-path]/[parent-entity-id]/[entity-path]/show/[entity-id] |
| edit | with disabled `assocTo` | /[prefix]/[parent-entity-path]/[parent-entity-id]/[entity-path]/edit/[entity-id] |
| create | with disabled `assocTo` | /[prefix]/[parent-entity-path]/[parent-entity-id]/[entity-path]/new |

The breadcrumb navigation will also include the path to the parent item.

### Example

Given this `assocTo` - `assocFrom` relationship between two entities

```yaml
entity:
  VehiceFleet: 
    attributes:
      name: Key
    assocFrom: Car

  Car: 
    attribute:
      licence: Key
      brand: String
    assocTo: VehiceFleet
```

At the action 

`/admin/vehicle-fleets/show/12345` 

will be (besided the values of the `VehiceFleet` item with the id `12345`) a table with all `Car` entity items of the `VehiceFleet`. If you click on a car item (e.g. `67890`), the detail `show` view of that car item will be shown. But the action will include the `VehicleFleet` item from which this car was selected as `parent`. 

The URL will be 

`/admin/vehicle-fleets/12345/cars/show/67890` 

