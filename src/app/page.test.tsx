'''
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';

// Mock Firebase hooks
jest.mock('@/firebase', () => ({
  useFirebase: () => ({ auth: {}, firestore: {} }),
  useUser: () => ({ user: { uid: 'test-user' }, isUserLoading: false }),
  useCollection: (query: any) => {
    if (!query) return { data: [], isLoading: false };
    // Simulate returning projects
    return {
      data: [{ id: 'project-1', name: 'My First Project' }],
      isLoading: false,
    };
  },
  useMemoFirebase: (factory: () => any) => factory(),
}));

// Mock other necessary modules
jest.mock('@/firebase/non-blocking-login', () => ({
  initiateAnonymousSignIn: jest.fn(),
}));


describe('Home Page', () => {
  it('renders the main components', () => {
    render(<Home />);
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('shows a loading state for projects', () => {
     // Redefine the mock for this specific test
    jest.spyOn(require('@/firebase'), 'useCollection').mockReturnValueOnce({ data: [], isLoading: true });
    render(<Home />);
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('displays a message when no projects are found', () => {
    jest.spyOn(require('@/firebase'), 'useCollection').mockReturnValueOnce({ data: [], isLoading: false });
    render(<Home />);
    expect(screen.getByText('No projects found. Create one to get started!')).toBeInTheDocument();
  });

  it('allows creating a new project', async () => {
    render(<Home />);

    fireEvent.click(screen.getByText('New Project'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Project name...'), {
      target: { value: 'A New Awesome Project' },
    });

    fireEvent.click(screen.getByText('Create Project'));

    // Check if the dialog closes and the new project is hypothetically created
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('shows the project selector when projects are available', () => {
    // The default mock for useCollection already provides one project
    render(<Home />);
    expect(screen.getByText('My First Project')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('allows switching between tabs', () => {
    render(<Home />);
    
    // Ensure a project is active so the tabs are visible
    expect(screen.getByText('My First Project')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Goals'));
    expect(screen.getByTestId('goal-setter-component')).toBeInTheDocument(); // Assuming GoalSetter has a test-id

    fireEvent.click(screen.getByText('Notes'));
    expect(screen.getByTestId('notes-section-component')).toBeInTheDocument(); // Assuming NotesSection has a test-id
  });
});
'''