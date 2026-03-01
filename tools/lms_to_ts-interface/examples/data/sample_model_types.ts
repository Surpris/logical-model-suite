// Generated from Logical Model: SampleProject
// Schema Version: 1.0

// ==========================================
// Entities (Nodes)
// ==========================================

/**
 * System user
 */
export interface User {
  id: string;
  name: string;
  role?: 'Admin' | 'User' | 'Guest';
}

/**
 * User group
 */
export interface Group {
  id?: string;
}

// ==========================================
// Relationships (Edges)
// Treated as independent interfaces for Property Graph capability
// ==========================================

/**
 * Group members
 * @note Cardinality: 1:N
 */
export interface Group_HasMember_User {
  /** Relationship Type Identifier */
  type: 'has_member';
  /** Source Entity ID (Group) */
  source_id: string;
  /** Target Entity ID (User) */
  target_id: string;
  /**
   * Date when user joined the group
   */
  joined_at?: Date;
}
