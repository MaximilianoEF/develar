import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, Inject, INJECTOR } from '@angular/core';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { map } from 'rxjs/operators';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FolderTree } from '../../../ingesta.model';
import { IngestaHelper } from '../../../ingesta.helper';


/** Flat node with expandable and level information */
export class FolderNode {
  constructor(
    public item: string,
    public level = 1,
    public expandable = false,
    public children: Array<any>,
    public id: string
  ) {}
}

export class DynamicDataSource implements DataSource<FolderNode> {
  dataChange = new BehaviorSubject<FolderNode[]>([]);

  get data(): FolderNode[] {
    return this.dataChange.value;
  }
  set data(value: FolderNode[]) {
    this._treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private _treeControl: FlatTreeControl<FolderNode>,
    private tree: FolderTree
  ) {}

  connect(collectionViewer: CollectionViewer): Observable<FolderNode[]> {
    this._treeControl.expansionModel.changed.subscribe((change) => {
      if (
        (change as SelectionChange<FolderNode>).added ||
        (change as SelectionChange<FolderNode>).removed
      ) {
        this.handleTreeControl(change as SelectionChange<FolderNode>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(
      map(() => this.data)
    );
  }

  disconnect(collectionViewer: CollectionViewer): void {}

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<FolderNode>) {
    if (change.added) {
      change.added.forEach((node) => this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach((node) => this.toggleNode(node, false));
    }
  }

  isExpandable(node: any): boolean {
    return node.children && node.children.length ? true : false;
  }

  /**
   * Toggle the node, remove from display list
   */
  toggleNode(node: FolderNode, expand: boolean) {
    const children = node.children;
    const index = this.data.indexOf(node);
    if (!children || index < 0) {
      return;
    }

    if (expand) {
      const nodes = children.map(
        (item) => {
          return new FolderNode(
            item.filename,
            node.level + 1,
            this.isExpandable(item),
            item.children,
            item._id
          );
        }
      );
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (
        let i = index + 1;
        i < this.data.length && this.data[i].level > node.level;
        i++, count++
      ) {}
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: 'assets-treeview-modal',
  templateUrl: './assets-treeview-modal.component.html',
  styleUrls: ['./assets-treeview-modal.component.scss']
})
export class AssetsTreeviewModalComponent implements OnInit {
  /** Propiedades que determinan el funcionamiento del mat-tree */
  treeControl: FlatTreeControl<FolderNode>;
  dataSource: DynamicDataSource;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.treeControl = new FlatTreeControl<FolderNode>(
      this.getLevel,
      this.isExpandable
    );
  }

  ngOnInit(): void {
    const matTreeData = IngestaHelper.buildTreeData(this.data);
    this.dataSource = new DynamicDataSource(this.treeControl, matTreeData);
    this.dataSource.data = [
      new FolderNode(matTreeData.filename, 0, true, matTreeData.children, matTreeData._id),
    ];
  }

  /** Métodos utilizados en el funcionamiento del mat-tree */
  getLevel = (node: FolderNode) => node.level;
  isExpandable = (node: FolderNode) => node.expandable;
  hasChild = (_: number, _nodeData: FolderNode) => _nodeData.expandable;

}
