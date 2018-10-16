import {Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loading = true;
  errors: any[];

  displayedColumns: string[] = [
    'id',
    'type',
    'name',
  ];
  dataSource: MatTableDataSource<any>;

  // Pagination
  pageSizeOptions: number[] = [10, 25, 50, 100];
  pageIndex = 1;
  pageSize = this.pageSizeOptions[0];
  totalCount = 0;
  startCursor: string;
  endCursor: string;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private apollo: Apollo
  ) {

  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  ngOnInit() {
    this.loadData('', '');
  }

  loadData(before: string, after: string) {
    if (before === undefined || before === null) {
      before = '';
    }
    if (after === undefined || after === null) {
      after = '';
    }

    this.apollo
    .watchQuery({
      query: gql`
        {
          allSourceSources(
            first: ${this.pageSize} ${before} ${after}
          ) {
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            edges {
              node {
                id
                type
                name
              }
              cursor
            }
          }
        }
      `,
    })
    .valueChanges.subscribe(result => {
      this.loading = result.loading;
      this.errors = result.errors;

      const sources: any[] = [];
      for (const edge of result.data['allSourceSources']['edges']) {
        sources.push(edge.node);
      }

      this.setPagination(
        this.pageSize,
        result.data['allSourceSources']['totalCount'],
        result.data['allSourceSources']['pageInfo']['startCursor'],
        result.data['allSourceSources']['pageInfo']['endCursor'],
      );

      if (this.dataSource === undefined) {
        this.dataSource = new MatTableDataSource<any[]>(sources);
        this.dataSource.paginator = this.paginator;
      } else {
        for (const source of sources) {
          if (this.dataSource.data.indexOf(source) === -1) {
            this.dataSource.data.push(source);
          }
        }
        this.dataSource.paginator._changePageSize(this.pageSize);
      }
    });
  }

  setPagination(pageSize, totalCount, startCursor, endCursor) {
    this.pageSize = pageSize;
    this.totalCount = totalCount;
    this.startCursor = startCursor;
    this.endCursor = endCursor;
  }

  onPaginateChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    let before = '';
    let after = '';

    if (this.pageIndex > 0) {
      if ( this.pageIndex > event.previousPageIndex && this.endCursor ) {
        before = ', after: "' + this.endCursor + '"';
      }
      if ( this.pageIndex < event.previousPageIndex && this.startCursor ) {
        after = ', before: "' + this.startCursor + '"';
      }
      if (before !== '' || after !== '') {
        this.loadData(before, after);
      }
    }
  }
}
